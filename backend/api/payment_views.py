import json
import uuid
from datetime import datetime
from django.utils import timezone
from django.contrib.auth.models import User
from django.db import transaction, IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import SubscriptionPlan, Subscription, Payment, WebhookEvent, ParentChild, SubscriptionSetting
from .paystack import initialize_transaction, verify_transaction, verify_webhook_signature, disable_subscription
from .subscription_service import seed_default_plans, activate_or_renew_subscription

import logging

logger = logging.getLogger(__name__)


class PlansListView(APIView):
    """
    Returns active subscription plans available for parents to purchase.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        seed_default_plans()
        plans = SubscriptionPlan.objects.filter(is_active=True).order_by('amount')
        data = [
            {
                "id": p.id,
                "plan_name": p.plan_name,
                "plan_description": p.plan_description,
                "amount": float(p.amount),
                "currency": p.currency,
                "billing_interval": p.billing_interval,
                "billing_interval_display": p.get_billing_interval_display(),
                "paystack_plan_code": p.paystack_plan_code,
            }
            for p in plans
        ]
        return Response({"plans": data}, status=status.HTTP_200_OK)


class InitializePaymentView(APIView):
    """
    Initializes a Paystack transaction for an authenticated parent.
    Endpoint: POST /api/subscription/initialize
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        # 1. Confirm that the parent is authenticated with appropriate role
        if not profile or profile.role not in ['parent', 'super_admin']:
            return Response(
                {"error": "Only authenticated parent accounts can initiate family subscriptions."},
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Retrieve parent's registered email
        parent_email = (user.email or '').strip()
        if not parent_email:
            return Response(
                {"error": "Parent account does not have a registered email address. Please update your email in your profile before subscribing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Retrieve the selected subscription plan from the database
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({"error": "plan_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response(
                {"error": "The selected subscription plan is invalid, inactive, or no longer available."},
                status=status.HTTP_404_NOT_FOUND
            )

        # 4. Check for duplicate payment attempt with explicit reference
        client_reference = request.data.get('reference')
        if client_reference and Payment.objects.filter(payment_reference=client_reference).exists():
            return Response(
                {"error": "Duplicate payment attempt. A transaction with this reference already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 5. Generate unique, non-guessable reference
        timestamp = int(timezone.now().timestamp())
        random_suffix = uuid.uuid4().hex[:8].upper()
        reference = f"DOLA-{timestamp}-{random_suffix}"
        while Payment.objects.filter(payment_reference=reference).exists():
            reference = f"DOLA-{int(timezone.now().timestamp())}-{uuid.uuid4().hex[:8].upper()}"

        # 6. Collect linked child IDs and attach rich metadata
        linked_children = list(ParentChild.objects.filter(parent=user).values_list('child_id', flat=True))

        metadata = {
            "parent_id": user.id,
            "parent_username": user.username,
            "parent_email": parent_email,
            "plan_id": plan.id,
            "plan_name": plan.plan_name,
            "billing_interval": plan.billing_interval,
            "covered_child_ids": linked_children,
            "custom_fields": [
                {
                    "display_name": "Account Type",
                    "variable_name": "account_type",
                    "value": "DolaCode Family Subscription"
                },
                {
                    "display_name": "Plan",
                    "variable_name": "plan_name",
                    "value": plan.plan_name
                },
                {
                    "display_name": "Parent Email",
                    "variable_name": "parent_email",
                    "value": parent_email
                }
            ]
        }

        # 7. Determine callback URL (defaults to /payment/callback)
        origin = request.headers.get('origin', '').rstrip('/')
        if not origin:
            origin = "https://dolacode.com.ng"
        default_callback = f"{origin}/payment/callback"
        callback_url = request.data.get('callback_url') or default_callback

        # 8. Create pending Payment record in database
        payment_record = Payment.objects.create(
            parent=user,
            payment_reference=reference,
            amount=plan.amount,
            currency=plan.currency,
            payment_status='pending',
            payment_channel='card'
        )

        # 9. Initialize transaction with Paystack API
        res = initialize_transaction(
            email=parent_email,
            amount_kobo=plan.amount_in_kobo,
            reference=reference,
            callback_url=callback_url,
            metadata=metadata,
            plan_code=plan.paystack_plan_code if plan.paystack_plan_code else None
        )

        if not res.get("status"):
            payment_record.payment_status = 'failed'
            payment_record.save(update_fields=['payment_status'])
            return Response(
                {"error": res.get("message", "Failed to initialize payment with Paystack gateway.")},
                status=status.HTTP_502_BAD_GATEWAY
            )

        # 10. Return authorization URL
        return Response({
            "success": True,
            "authorization_url": res["authorization_url"],
            "access_code": res.get("access_code", ""),
            "reference": reference,
            "amount": float(plan.amount),
            "currency": plan.currency,
            "plan": {
                "id": plan.id,
                "name": plan.plan_name,
                "billing_interval": plan.billing_interval
            }
        }, status=status.HTTP_200_OK)


class VerifyPaymentView(APIView):
    """
    Secure backend payment verification against Paystack.
    Endpoint: GET /api/subscription/verify?reference=...
    Also supports POST /api/subscription/verify with { "reference": "..." }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return self._verify(request)

    def post(self, request):
        return self._verify(request)

    def _verify(self, request):
        reference = (
            request.query_params.get('reference') or
            request.query_params.get('trxref') or
            (request.data.get('reference', '') if hasattr(request, 'data') else '')
        ).strip()

        if not reference:
            return Response(
                {"error": "Payment reference is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check existing payment record in DB
        payment = Payment.objects.filter(payment_reference=reference).select_related('parent', 'subscription', 'subscription__plan').first()

        # Authorization check on existing record
        if payment and payment.parent != request.user and not request.user.is_superuser:
            return Response(
                {"error": "Unauthorized. This payment reference does not belong to your account."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Idempotency: If already verified and marked success, return active status immediately
        if payment and payment.payment_status == 'success':
            sub = payment.subscription or Subscription.objects.filter(parent=payment.parent).order_by('-created_at').first()
            return Response({
                "success": True,
                "already_processed": True,
                "message": "Payment has already been verified and family subscription is active.",
                "reference": reference,
                "status": "success",
                "plan_name": sub.plan.plan_name if (sub and sub.plan) else "Family Subscription",
                "current_period_end": sub.current_period_end.isoformat() if (sub and sub.current_period_end) else None
            }, status=status.HTTP_200_OK)

        # Query Paystack API directly from backend
        verify_res = verify_transaction(reference)
        if not verify_res.get("verified"):
            return Response({
                "success": False,
                "error": verify_res.get("message", "Unable to verify transaction with payment provider. Please try again.")
            }, status=status.HTTP_400_BAD_REQUEST)

        tx_data = verify_res.get("data", {})

        # 1. Confirm transaction status is success
        tx_status = tx_data.get("status")
        if tx_status != "success":
            if payment:
                payment.payment_status = 'failed' if tx_status == 'failed' else tx_status
                payment.save(update_fields=['payment_status'])
            return Response({
                "success": False,
                "status": tx_status,
                "reference": reference,
                "message": f"Payment was not successful (Status: {tx_status}). Subscription was not activated. You may try again."
            }, status=status.HTTP_400_BAD_REQUEST)

        # 2. Confirm reference matches original transaction
        tx_reference = tx_data.get("reference")
        if tx_reference != reference:
            return Response(
                {"error": "Transaction reference mismatch."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Confirm currency is NGN
        tx_currency = (tx_data.get("currency") or "").upper()
        if tx_currency != "NGN":
            return Response(
                {"error": f"Invalid currency '{tx_currency}'. Only NGN transactions are accepted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Confirm payment belongs to authenticated parent
        metadata = tx_data.get("metadata") or {}
        meta_parent_id = metadata.get("parent_id")
        customer_email = (tx_data.get("customer") or {}).get("email", "").strip().lower()
        user_email = (request.user.email or "").strip().lower()

        if meta_parent_id and str(meta_parent_id) != str(request.user.id) and not request.user.is_superuser:
            return Response(
                {"error": "Unauthorized. This transaction metadata does not match your parent account."},
                status=status.HTTP_403_FORBIDDEN
            )

        if customer_email and user_email and customer_email != user_email and not request.user.is_superuser:
            return Response(
                {"error": "Unauthorized. Transaction email does not match your registered parent account email."},
                status=status.HTTP_403_FORBIDDEN
            )

        # 5. Retrieve plan and confirm amount matches
        plan_id = metadata.get("plan_id")
        plan = None
        if plan_id:
            plan = SubscriptionPlan.objects.filter(id=plan_id).first()

        tx_amount_kobo = tx_data.get("amount", 0)
        if not plan:
            plan = SubscriptionPlan.objects.filter(amount=tx_amount_kobo / 100.0).first() or SubscriptionPlan.objects.filter(is_active=True).first()

        if plan and tx_amount_kobo != plan.amount_in_kobo:
            return Response(
                {"error": f"Paid amount ({tx_amount_kobo / 100:.2f} NGN) does not match expected subscription price ({plan.amount:.2f} NGN)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 6. Save payment record, update status, and atomically activate subscription
        with transaction.atomic():
            if not payment:
                payment = Payment.objects.create(
                    parent=request.user,
                    payment_reference=reference,
                    amount=tx_amount_kobo / 100.0,
                    currency='NGN',
                    payment_status='pending',
                    payment_channel=tx_data.get('channel', 'card')
                )

            sub = activate_or_renew_subscription(request.user, plan, payment, tx_data)

        return Response({
            "success": True,
            "message": "Payment verified successfully! Your family subscription is now active.",
            "reference": reference,
            "status": "success",
            "plan_name": plan.plan_name if plan else "Family Subscription",
            "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None
        }, status=status.HTTP_200_OK)


def notify_parent_payment_failed(parent, subscription, grace_days: int = 3):
    """
    Sends an automated notification to a parent when a recurring payment fails.
    Uses DolaCode's email dispatcher (Brevo/Resend/SMTP).
    """
    if not parent or not parent.email:
        return

    try:
        from .emails import send_subscription_payment_failed_email
        send_subscription_payment_failed_email(parent, subscription, grace_days=grace_days)
        logger.info(f"Payment failure notification email dispatched to parent {parent.email}")
    except Exception as e:
        logger.error(f"Error sending payment failure email to {parent.email}: {e}")


def notify_parent_renewal_success(parent, subscription, amount_paid, next_billing_date):
    """
    Sends an automated receipt and confirmation email to a parent when an automated Paystack
    recurring subscription renewal succeeds.
    """
    if not parent or not parent.email:
        return

    try:
        from .emails import send_subscription_renewal_success_email
        send_subscription_renewal_success_email(parent, subscription, amount_paid, next_billing_date)
        logger.info(f"Renewal success notification email dispatched to parent {parent.email}")
    except Exception as e:
        logger.error(f"Error sending renewal success email to {parent.email}: {e}")



@method_decorator(csrf_exempt, name='dispatch')
class PaystackWebhookView(APIView):
    """
    Secure Paystack Webhook Endpoint.
    Route: POST /api/webhooks/paystack
    Verifies raw request body with HMAC SHA512 using PAYSTACK_SECRET_KEY.
    Prevents duplicate replays and processes out-of-order events idempotently.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # 1. Signature Verification
        signature = request.headers.get('x-paystack-signature', '')
        if not signature:
            logger.warning("Paystack webhook rejected: Missing x-paystack-signature header.")
            return Response({"error": "Signature missing"}, status=status.HTTP_400_BAD_REQUEST)

        raw_body = request.body
        if not verify_webhook_signature(raw_body, signature):
            logger.error("Paystack webhook rejected: HMAC SHA512 signature mismatch.")
            return Response({"error": "Invalid webhook signature"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Parse JSON Payload
        try:
            payload = json.loads(raw_body.decode('utf-8'))
        except Exception as e:
            logger.warning(f"Paystack webhook rejected: Malformed JSON payload ({e}).")
            return Response({"error": "Invalid JSON"}, status=status.HTTP_400_BAD_REQUEST)

        event_name = payload.get('event', '')
        data = payload.get('data', {})
        reference = data.get('reference', '')

        # 3. Prevent Replay & Duplicate Processing
        # Generate deterministic event ID
        raw_event_id = payload.get('id') or data.get('id') or reference or data.get('subscription_code')
        if not raw_event_id:
            raw_event_id = hashlib.sha256(raw_body).hexdigest()[:24]
        event_id = f"ps_{event_name}_{raw_event_id}"

        # Idempotency check: if event was already received and processed, acknowledge immediately
        existing_event = WebhookEvent.objects.filter(event_id=event_id).first()
        if existing_event and existing_event.processing_status == 'processed':
            logger.info(f"Duplicate Paystack webhook event already processed: {event_id}")
            return Response({"status": "ignored", "message": "Duplicate event already processed"}, status=status.HTTP_200_OK)

        # Record incoming event record
        webhook_record, _ = WebhookEvent.objects.get_or_create(
            event_id=event_id,
            defaults={
                "event_type": event_name,
                "payment_reference": reference,
                "processing_status": 'pending'
            }
        )

        logger.info(f"Processing verified Paystack webhook: event={event_name}, id={event_id}")

        try:
            # -------------------------------------------------------------
            # EVENT: charge.success
            # -------------------------------------------------------------
            if event_name == 'charge.success':
                self._handle_charge_success(data, reference)
                webhook_record.processing_status = 'processed'

            # -------------------------------------------------------------
            # EVENT: subscription.create
            # -------------------------------------------------------------
            elif event_name == 'subscription.create':
                self._handle_subscription_create(data)
                webhook_record.processing_status = 'processed'

            # -------------------------------------------------------------
            # EVENT: subscription.disable
            # -------------------------------------------------------------
            elif event_name == 'subscription.disable':
                self._handle_subscription_disable(data)
                webhook_record.processing_status = 'processed'

            # -------------------------------------------------------------
            # EVENT: subscription.not_renew
            # -------------------------------------------------------------
            elif event_name == 'subscription.not_renew':
                self._handle_subscription_disable(data)
                webhook_record.processing_status = 'processed'

            # -------------------------------------------------------------
            # EVENT: invoice.create
            # -------------------------------------------------------------
            elif event_name == 'invoice.create':
                self._handle_invoice_create(data)
                webhook_record.processing_status = 'processed'

            # -------------------------------------------------------------
            # EVENT: invoice.payment_failed
            # -------------------------------------------------------------
            elif event_name == 'invoice.payment_failed':
                self._handle_invoice_payment_failed(data)
                webhook_record.processing_status = 'processed'

            # -------------------------------------------------------------
            # EVENT: invoice.update
            # -------------------------------------------------------------
            elif event_name == 'invoice.update':
                self._handle_invoice_update(data)
                webhook_record.processing_status = 'processed'

            # -------------------------------------------------------------
            # UNHANDLED / INFORMATIONAL EVENTS
            # -------------------------------------------------------------
            else:
                logger.info(f"Informational Paystack event received: {event_name}")
                webhook_record.processing_status = 'ignored'

            webhook_record.processed_at = timezone.now()
            webhook_record.save(update_fields=['processing_status', 'processed_at'])

        except Exception as e:
            logger.exception(f"Error handling Paystack webhook event {event_id}: {e}")
            webhook_record.processing_status = 'failed'
            webhook_record.processed_at = timezone.now()
            webhook_record.save(update_fields=['processing_status', 'processed_at'])

        # Paystack requires a fast 200 OK
        return Response({"status": "received"}, status=status.HTTP_200_OK)

    def _handle_charge_success(self, data: dict, reference: str):
        """
        Processes verified charge.success events.
        Idempotently activates or extends the family subscription.
        """
        payment = None
        if reference:
            payment = Payment.objects.filter(payment_reference=reference).select_related('parent').first()

        metadata = data.get('metadata') or {}
        parent = None

        if payment:
            parent = payment.parent

        if not parent:
            parent_id = metadata.get('parent_id')
            if parent_id:
                parent = User.objects.filter(id=parent_id).first()

        if not parent:
            customer_email = (data.get('customer') or {}).get('email', '').strip().lower()
            if customer_email:
                parent = User.objects.filter(email__iexact=customer_email).first()

        if not parent:
            logger.warning(f"charge.success webhook could not resolve parent user for reference {reference}")
            return

        # Locate plan
        plan_id = metadata.get('plan_id')
        plan = SubscriptionPlan.objects.filter(id=plan_id).first() if plan_id else None
        if not plan:
            amount_naira = float(data.get('amount', 0)) / 100.0
            plan = SubscriptionPlan.objects.filter(amount=amount_naira).first() or SubscriptionPlan.objects.filter(is_active=True).first()

        with transaction.atomic():
            if not payment:
                payment = Payment.objects.create(
                    parent=parent,
                    payment_reference=reference or f"DOLA-RECUR-{int(timezone.now().timestamp())}",
                    amount=float(data.get('amount', 0)) / 100.0,
                    currency=(data.get('currency') or 'NGN').upper(),
                    payment_status='pending',
                    payment_channel=data.get('channel', 'card')
                )

            # Activate/renew family subscription
            sub = activate_or_renew_subscription(parent, plan, payment, data)
            if sub and parent and parent.email:
                amt = float(payment.amount) if payment else (float(sub.subscribed_amount) if sub.subscribed_amount else float(plan.amount))
                notify_parent_renewal_success(parent, sub, amt, sub.next_payment_date or sub.current_period_end)

    def _handle_subscription_create(self, data: dict):
        """
        Processes subscription.create event to link Paystack subscription code and email token.
        """
        sub_code = data.get('subscription_code')
        email_token = data.get('email_token')
        customer = data.get('customer') or {}
        customer_code = customer.get('customer_code')
        customer_email = (customer.get('email') or '').strip().lower()

        sub = None
        if sub_code:
            sub = Subscription.objects.filter(paystack_subscription_code=sub_code).first()
        if not sub and customer_code:
            sub = Subscription.objects.filter(paystack_customer_code=customer_code).first()
        if not sub and customer_email:
            sub = Subscription.objects.filter(parent__email__iexact=customer_email).order_by('-created_at').first()

        if sub:
            updated_fields = []
            if sub_code and sub.paystack_subscription_code != sub_code:
                sub.paystack_subscription_code = sub_code
                updated_fields.append('paystack_subscription_code')
            if email_token and sub.paystack_email_token != email_token:
                sub.paystack_email_token = email_token
                updated_fields.append('paystack_email_token')
            if customer_code and sub.paystack_customer_code != customer_code:
                sub.paystack_customer_code = customer_code
                updated_fields.append('paystack_customer_code')

            next_payment_date_str = data.get('next_payment_date')
            if next_payment_date_str:
                try:
                    # ISO 8601 parsing
                    from django.utils.dateparse import parse_datetime
                    dt = parse_datetime(next_payment_date_str)
                    if dt:
                        sub.next_payment_date = dt
                        updated_fields.append('next_payment_date')
                except Exception as e:
                    logger.warning(f"Failed parsing next_payment_date '{next_payment_date_str}': {e}")

            if sub.subscription_status in ['inactive', 'past_due']:
                sub.subscription_status = 'active'
                sub.grace_period_end = None
                updated_fields.extend(['subscription_status', 'grace_period_end'])

            if updated_fields:
                sub.save(update_fields=updated_fields)
                logger.info(f"Subscription #{sub.id} updated from subscription.create event: {updated_fields}")

    def _handle_subscription_disable(self, data: dict):
        """
        Processes subscription.disable and subscription.not_renew events.
        Preserves student progress and respects the paid-through period.
        """
        sub_code = data.get('subscription_code')
        customer = data.get('customer') or {}
        customer_code = customer.get('customer_code')
        customer_email = (customer.get('email') or '').strip().lower()

        sub = None
        if sub_code:
            sub = Subscription.objects.filter(paystack_subscription_code=sub_code).first()
        if not sub and customer_code:
            sub = Subscription.objects.filter(paystack_customer_code=customer_code).first()
        if not sub and customer_email:
            sub = Subscription.objects.filter(parent__email__iexact=customer_email).order_by('-created_at').first()

        if sub:
            now = timezone.now()
            sub.subscription_status = 'cancelled'
            sub.cancellation_date = now
            # Note: current_period_end is preserved so children maintain learning access through their paid-through date
            sub.save(update_fields=['subscription_status', 'cancellation_date'])
            logger.info(f"Subscription #{sub.id} marked as cancelled. Paid-through access preserved until {sub.current_period_end}")

    def _handle_invoice_create(self, data: dict):
        """
        Processes invoice.create event for upcoming subscription renewals.
        """
        sub_code = data.get('subscription', {}).get('subscription_code') if isinstance(data.get('subscription'), dict) else data.get('subscription_code')
        amount_kobo = data.get('amount')
        logger.info(f"Upcoming Paystack invoice created: subscription={sub_code}, amount={amount_kobo} kobo")

    def _handle_invoice_payment_failed(self, data: dict):
        """
        Processes invoice.payment_failed event.
        Marks subscription past_due, sets a 3-day grace period, and notifies parent.
        """
        sub_code = data.get('subscription', {}).get('subscription_code') if isinstance(data.get('subscription'), dict) else data.get('subscription_code')
        customer = data.get('customer') or {}
        customer_code = customer.get('customer_code')
        customer_email = (customer.get('email') or '').strip().lower()

        sub = None
        if sub_code:
            sub = Subscription.objects.filter(paystack_subscription_code=sub_code).first()
        if not sub and customer_code:
            sub = Subscription.objects.filter(paystack_customer_code=customer_code).first()
        if not sub and customer_email:
            sub = Subscription.objects.filter(parent__email__iexact=customer_email).order_by('-created_at').first()

        if sub:
            now = timezone.now()
            grace_days = SubscriptionSetting.get_grace_period_days()
            sub.subscription_status = 'past_due'
            sub.grace_period_end = now + timezone.timedelta(days=grace_days)
            sub.save(update_fields=['subscription_status', 'grace_period_end'])

            # Record failed payment record for audit trail
            Payment.objects.create(
                parent=sub.parent,
                subscription=sub,
                payment_reference=f"RENEW-FAIL-{int(now.timestamp())}-{uuid.uuid4().hex[:6].upper()}",
                amount=(float(data.get('amount', 0)) / 100.0) if data.get('amount') else (sub.subscribed_amount or sub.plan.amount),
                currency='NGN',
                payment_status='failed',
                payment_channel=data.get('channel', 'card')
            )

            logger.warning(f"Subscription #{sub.id} marked past_due following failed recurring invoice. Grace until {sub.grace_period_end} ({grace_days} days)")

            # Notify parent via automated email
            notify_parent_payment_failed(sub.parent, sub, grace_days=grace_days)

    def _handle_invoice_update(self, data: dict):
        """
        Processes invoice.update event. If invoice is paid, restores past_due subscriptions.
        """
        is_paid = data.get('paid') is True or data.get('status') == 'success'
        if not is_paid:
            return

        sub_code = data.get('subscription', {}).get('subscription_code') if isinstance(data.get('subscription'), dict) else data.get('subscription_code')
        customer = data.get('customer') or {}
        customer_code = customer.get('customer_code')
        customer_email = (customer.get('email') or '').strip().lower()

        sub = None
        if sub_code:
            sub = Subscription.objects.filter(paystack_subscription_code=sub_code).first()
        if not sub and customer_code:
            sub = Subscription.objects.filter(paystack_customer_code=customer_code).first()
        if not sub and customer_email:
            sub = Subscription.objects.filter(parent__email__iexact=customer_email).order_by('-created_at').first()

        if sub and sub.subscription_status == 'past_due':
            sub.subscription_status = 'active'
            sub.grace_period_end = None
            sub.save(update_fields=['subscription_status', 'grace_period_end'])
            logger.info(f"Subscription #{sub.id} restored to active following invoice.update confirmation.")


class CancelSubscriptionView(APIView):
    """
    Allows a parent to cancel their subscription.
    Access remains active until current_period_end.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        sub = Subscription.objects.filter(
            parent=user,
            subscription_status__in=['active', 'past_due']
        ).first()

        if not sub:
            return Response({"error": "No active subscription found to cancel."}, status=status.HTTP_404_NOT_FOUND)

        if sub.paystack_subscription_code and sub.paystack_email_token:
            disable_subscription(sub.paystack_subscription_code, sub.paystack_email_token)

        sub.subscription_status = 'cancelled'
        sub.cancellation_date = timezone.now()
        sub.save(update_fields=['subscription_status', 'cancellation_date'])

        return Response({
            "success": True,
            "message": "Subscription cancelled. Your children will retain access until the end of your current billing period.",
            "access_until": sub.current_period_end.isoformat() if sub.current_period_end else None
        }, status=status.HTTP_200_OK)


class SubscriptionStatusView(APIView):
    """
    Returns the comprehensive subscription status and history for an authenticated parent.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        sub = Subscription.objects.filter(parent=user).select_related('plan').order_by('-created_at').first()

        children = ParentChild.objects.filter(parent=user).select_related('child')
        children_list = [
            {
                "id": c.child.id,
                "username": c.child.username,
                "email": c.child.email,
                "age": getattr(c.child, 'profile', None).age if getattr(c.child, 'profile', None) else None,
            }
            for c in children
        ]

        recent_payments = Payment.objects.filter(parent=user).order_by('-created_at')[:5]
        payments_list = [
            {
                "reference": p.payment_reference,
                "amount": float(p.amount),
                "currency": p.currency,
                "status": p.payment_status,
                "date": p.payment_date.isoformat() if p.payment_date else p.created_at.isoformat()
            }
            for p in recent_payments
        ]

        now = timezone.now()
        is_active = sub.is_valid() if sub else False

        data = {
            "has_subscription": sub is not None,
            "is_active": is_active,
            "plan_name": sub.plan.plan_name if (sub and sub.plan) else "None",
            "status": sub.subscription_status if sub else "inactive",
            "current_period_end": sub.current_period_end.isoformat() if (sub and sub.current_period_end) else None,
            "grace_period_end": sub.grace_period_end.isoformat() if (sub and sub.grace_period_end) else None,
            "covered_children_count": len(children_list),
            "children": children_list,
            "recent_payments": payments_list
        }

        return Response(data, status=status.HTTP_200_OK)


class SubscriptionAccessCheckView(APIView):
    """
    Verifies on the server whether the requesting user has access to a requested learning feature or stage.
    Route: GET /api/subscription/access-check/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        feature = request.query_params.get('feature', '').strip()
        stage = request.query_params.get('stage')
        part = request.query_params.get('part')

        stage_num = int(stage) if stage and stage.isdigit() else None
        part_num = int(part) if part and part.isdigit() else None

        user = request.user if request.user and request.user.is_authenticated else None

        # Sample lesson rule: Stage 1 Chapter 1 (Part 1) is free to all
        if feature in ['stage1_part1', 'stage1_chapter1', 'sample_lesson'] or (stage_num == 1 and part_num == 1):
            return Response({
                "allowed": True,
                "status": "sample_access",
                "is_sample": True,
                "headline": "Free Sample Lesson",
                "subtext": "You are exploring Stage 1 Chapter 1 (Number Sense Foundation).",
                "cta_text": "UNLOCK FULL ADVENTURE",
                "cta_url": "/subscribe"
            }, status=status.HTTP_200_OK)

        if not user:
            return Response({
                "allowed": False,
                "status": "unauthenticated",
                "headline": "Your DolaCode adventure is waiting!",
                "subtext": "Ask your parent to unlock your learning world.",
                "cta_text": "UNLOCK DOLACODE",
                "cta_url": "/signup?redirect=/subscribe"
            }, status=status.HTTP_200_OK)

        from .subscription_service import check_learning_access
        access_result = check_learning_access(user, feature=feature, stage=stage_num, part=part_num)
        return Response(access_result, status=status.HTTP_200_OK)
