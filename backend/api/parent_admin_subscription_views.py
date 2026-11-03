import json
import logging
from datetime import timedelta
from decimal import Decimal

from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone
from django.contrib.auth.models import User

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import (
    SubscriptionPlan, Subscription, Payment, ParentChild,
    UserProfile, AdminAuditLog, StudentCompetency, SubscriptionSetting
)
from .paystack import (
    disable_subscription,
    generate_subscription_manage_link,
    send_subscription_manage_email,
    create_paystack_plan
)
from .subscription_service import seed_default_plans, process_expired_subscriptions

logger = logging.getLogger(__name__)


class IsAdminUserOrSuperAdmin(permissions.BasePermission):
    """
    Role-based access control: strictly allows superusers, staff,
    or users with user.profile.role == 'super_admin'.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        profile = getattr(request.user, 'profile', None)
        return bool(profile and profile.role in ['super_admin'])


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


# =====================================================================
# PARENT SUBSCRIPTION MANAGEMENT ENDPOINTS
# =====================================================================

class ParentSubscriptionDetailView(APIView):
    """
    Comprehensive view of the authenticated parent's subscription,
    covered children, and previous payment history.
    Route: GET /api/parent/subscription/detail/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        if profile and profile.role not in ['parent', 'super_admin'] and not user.is_staff and not user.is_superuser:
            return Response(
                {"error": "Only parent accounts can manage family subscriptions."},
                status=status.HTTP_403_FORBIDDEN
            )

        now = timezone.now()

        # Seed default plans if none exist yet
        seed_default_plans()

        # Fetch latest subscription
        sub = Subscription.objects.filter(parent=user).select_related('plan').order_by('-created_at').first()

        # Evaluate live status
        live_status = 'inactive'
        if sub:
            live_status = sub.subscription_status
            if sub.subscription_status == 'active' and sub.current_period_end and sub.current_period_end < now:
                live_status = 'expired'
            elif sub.subscription_status == 'past_due' and sub.grace_period_end and sub.grace_period_end < now:
                live_status = 'expired'
            elif sub.subscription_status == 'cancelled' and sub.current_period_end and sub.current_period_end < now:
                live_status = 'expired'

        # Fetch covered children
        child_links = ParentChild.objects.filter(parent=user).select_related('child', 'child__profile')
        children_data = []
        for cl in child_links:
            ch = cl.child
            ch_profile = getattr(ch, 'profile', None)
            children_data.append({
                "id": ch.id,
                "username": ch.username,
                "first_name": ch.first_name,
                "last_name": ch.last_name,
                "age": ch_profile.age if ch_profile else None,
                "points": ch_profile.points if ch_profile else 0,
                "current_streak": ch_profile.current_streak if ch_profile else 0,
                "stage1_progress": ch_profile.stage1_progress if ch_profile else 0,
                "stage2_progress": ch_profile.stage2_progress if ch_profile else 0,
                "stage3_progress": ch_profile.stage3_progress if ch_profile else 0,
                "stage4_progress": ch_profile.stage4_progress if ch_profile else 0,
                "badges_count": ch.earned_badges.count()
            })

        # Fetch payment history
        payments = Payment.objects.filter(parent=user).order_by('-created_at')[:20]
        payments_data = []
        for p in payments:
            payments_data.append({
                "reference": p.payment_reference,
                "amount": float(p.amount),
                "currency": p.currency,
                "status": p.payment_status,
                "channel": p.payment_channel or 'Card',
                "paystack_transaction_id": p.paystack_transaction_id,
                "date": (p.payment_date or p.created_at).isoformat(),
                "has_receipt": p.payment_status == 'success'
            })

        # Fetch available plans for plan switching
        active_plans = SubscriptionPlan.objects.filter(is_active=True).order_by('amount')
        plans_data = [
            {
                "id": pl.id,
                "plan_name": pl.plan_name,
                "plan_description": pl.plan_description,
                "amount": float(pl.amount),
                "currency": pl.currency,
                "billing_interval": pl.billing_interval,
                "billing_interval_display": pl.get_billing_interval_display(),
                "is_promotional": pl.is_promotional,
                "promotional_price": float(pl.promotional_price) if pl.promotional_price else None,
                "promotional_headline": pl.promotional_headline,
                "features": pl.features
            }
            for pl in active_plans
        ]

        sub_info = None
        if sub:
            effective_amount = float(sub.subscribed_amount) if sub.subscribed_amount else (float(sub.plan.amount) if sub.plan else 0.0)
            sub_info = {
                "id": sub.id,
                "plan_id": sub.plan.id if sub.plan else None,
                "plan_name": sub.plan.plan_name if sub.plan else "Custom Family Plan",
                "plan_description": sub.plan.plan_description if sub.plan else "",
                "billing_interval": sub.plan.billing_interval if sub.plan else "monthly",
                "billing_interval_display": sub.plan.get_billing_interval_display() if sub.plan else "Monthly",
                "amount_paid": effective_amount,
                "currency": sub.plan.currency if sub.plan else "NGN",
                "status": live_status,
                "subscription_start_date": (sub.subscription_start_date or sub.created_at).isoformat(),
                "current_period_start": sub.current_period_start.isoformat() if sub.current_period_start else None,
                "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
                "next_payment_date": sub.next_payment_date.isoformat() if sub.next_payment_date else (sub.current_period_end.isoformat() if sub.current_period_end else None),
                "cancellation_date": sub.cancellation_date.isoformat() if sub.cancellation_date else None,
                "grace_period_end": sub.grace_period_end.isoformat() if sub.grace_period_end else None,
                "is_valid": sub.is_valid(),
                "is_manual_compensation": sub.is_manual_compensation,
                "features": sub.plan.features if sub.plan else ["all"],
                "has_paystack_subscription": bool(sub.paystack_subscription_code)
            }

        return Response({
            "has_subscription": sub is not None,
            "subscription": sub_info,
            "status": live_status,
            "children": children_data,
            "payments": payments_data,
            "available_plans": plans_data,
            "can_cancel": live_status in ['active', 'past_due'],
            "can_update_payment_method": bool(sub and sub.paystack_subscription_code),
            "can_renew": live_status in ['expired', 'cancelled', 'inactive'] or sub is None
        }, status=status.HTTP_200_OK)


class ParentCancelSubscriptionView(APIView):
    """
    Cancels an active recurring subscription for the parent.
    Calls Paystack's official subscription disable API.
    Does NOT delete the child accounts or the subscription history.
    Preserves child projects, XP, badges, achievements, and progress.
    Retains access through current_period_end.
    Route: POST /api/parent/subscription/cancel/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        sub = Subscription.objects.filter(
            parent=user,
            subscription_status__in=['active', 'past_due']
        ).select_related('plan').order_by('-created_at').first()

        if not sub:
            return Response(
                {"error": "No active or past-due subscription found to cancel."},
                status=status.HTTP_404_NOT_FOUND
            )

        now = timezone.now()
        access_until = sub.current_period_end or now

        # Call Paystack to disable future recurring rebills
        paystack_status = "not_linked"
        if sub.paystack_subscription_code and sub.paystack_email_token:
            ps_res = disable_subscription(sub.paystack_subscription_code, sub.paystack_email_token)
            paystack_status = "disabled_on_paystack" if ps_res.get("status") else f"gateway_error: {ps_res.get('message')}"
            logger.info(f"Paystack disable result for sub #{sub.id}: {paystack_status}")

        with transaction.atomic():
            sub.subscription_status = 'cancelled'
            sub.cancellation_date = now
            # CRITICAL: Preserve current_period_end so access remains active until the end of the paid cycle
            sub.save(update_fields=['subscription_status', 'cancellation_date'])

            # Log administrative / user action
            AdminAuditLog.objects.create(
                admin_user=user,
                action='PARENT_CANCELLED_SUBSCRIPTION',
                target_model='Subscription',
                target_id=str(sub.id),
                details={
                    "parent_username": user.username,
                    "parent_email": user.email,
                    "plan_name": sub.plan.plan_name if sub.plan else "Custom",
                    "access_until": access_until.isoformat(),
                    "paystack_status": paystack_status
                },
                ip_address=get_client_ip(request)
            )

        formatted_date = access_until.strftime("%B %d, %Y")
        return Response({
            "success": True,
            "status": "cancelled",
            "message": f"Your subscription has been cancelled. Your children will continue to enjoy full access until {formatted_date}.",
            "access_until": access_until.isoformat(),
            "preservation_notice": "All saved projects, coding achievements, XP, badges, and learning progress remain 100% safe."
        }, status=status.HTTP_200_OK)


class ParentUpdatePaymentMethodView(APIView):
    """
    Generates a secure Paystack subscription management link so the parent
    can update their credit/debit card on Paystack's official portal.
    Route: POST /api/parent/subscription/update-payment-method/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        sub = Subscription.objects.filter(parent=user).order_by('-created_at').first()

        if not sub or not sub.paystack_subscription_code:
            return Response(
                {"error": "No recurring Paystack subscription code found for this account. If you paid via a one-time transaction, simply renew when your period expires."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Attempt to generate link via Paystack API
        res = generate_subscription_manage_link(sub.paystack_subscription_code)
        if res.get("status") and res.get("link"):
            return Response({
                "success": True,
                "type": "link",
                "management_url": res["link"],
                "message": "Click the link to securely update your payment card on Paystack."
            }, status=status.HTTP_200_OK)

        # 2. Fallback: Request Paystack to send an email manage link directly to the parent's email
        email_res = send_subscription_manage_email(sub.paystack_subscription_code)
        if email_res.get("status"):
            return Response({
                "success": True,
                "type": "email_dispatched",
                "message": f"Paystack has dispatched a secure payment update link to {user.email}. Please check your inbox."
            }, status=status.HTTP_200_OK)

        return Response({
            "success": False,
            "error": res.get("message") or email_res.get("message") or "Unable to initiate payment method update at this time."
        }, status=status.HTTP_502_BAD_GATEWAY)


class ParentPaymentReceiptView(APIView):
    """
    Returns an itemized, printable receipt for any successful payment reference
    belonging to the parent.
    Route: GET /api/parent/payments/<str:reference>/receipt/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, reference):
        payment = Payment.objects.filter(
            payment_reference=reference
        ).select_related('parent', 'subscription', 'subscription__plan').first()

        if not payment:
            return Response({"error": "Payment receipt not found."}, status=status.HTTP_404_NOT_FOUND)

        if payment.parent != request.user and not request.user.is_superuser and not request.user.is_staff:
            return Response({"error": "Unauthorized to view this receipt."}, status=status.HTTP_403_FORBIDDEN)

        # Children covered
        covered_children = list(
            ParentChild.objects.filter(parent=payment.parent).values_list('child__username', flat=True)
        )

        plan = payment.subscription.plan if payment.subscription else None

        receipt_data = {
            "receipt_number": f"REC-{payment.payment_reference}",
            "reference": payment.payment_reference,
            "paystack_transaction_id": payment.paystack_transaction_id or "N/A",
            "date": (payment.payment_date or payment.created_at).isoformat(),
            "parent_name": payment.parent.get_full_name() or payment.parent.username,
            "parent_email": payment.parent.email,
            "plan_name": plan.plan_name if plan else "DolaCode Family Membership",
            "billing_interval": plan.get_billing_interval_display() if plan else "Monthly",
            "amount": float(payment.amount),
            "currency": payment.currency,
            "payment_channel": payment.payment_channel or "Card",
            "payment_status": payment.payment_status,
            "covered_children": covered_children,
            "issuer": {
                "name": "DolaCode (Devnaija Tech)",
                "website": "https://dolacode.com.ng",
                "support_email": "support@dolacode.com.ng",
                "country": "Nigeria"
            }
        }

        return Response({"receipt": receipt_data}, status=status.HTTP_200_OK)


# =====================================================================
# ADMIN DASHBOARD: SUBSCRIPTIONS & PAYMENTS SECTION ENDPOINTS
# =====================================================================

class AdminSubscriptionOverviewView(APIView):
    """
    Delivers top-level platform subscription and revenue metrics for the Admin Dashboard.
    Route: GET /api/admin/subscriptions/overview/
    """
    permission_classes = [IsAdminUserOrSuperAdmin]

    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Registered Users
        total_parents = UserProfile.objects.filter(role='parent').count()
        total_students = UserProfile.objects.filter(role='student').count()

        # Subscription status counts
        all_subs = Subscription.objects.all()
        active_subs = all_subs.filter(subscription_status='active', current_period_end__gte=now).count()
        past_due_subs = all_subs.filter(subscription_status='past_due').count()
        cancelled_subs = all_subs.filter(subscription_status='cancelled').count()
        expired_subs = all_subs.filter(
            Q(subscription_status='expired') |
            Q(subscription_status='active', current_period_end__lt=now)
        ).count()

        # Inactive count: parents with inactive subscription or no subscription
        parents_with_subs = set(all_subs.values_list('parent_id', flat=True))
        parents_without_sub = total_parents - len(parents_with_subs)
        inactive_subs = all_subs.filter(subscription_status='inactive').count() + max(0, parents_without_sub)

        # Successful payments
        successful_payments = Payment.objects.filter(payment_status='success')
        total_successful_payments = successful_payments.count()

        # Monthly Recurring Revenue (MRR) calculation
        # Normalize active subscriptions to their monthly equivalent in NGN
        active_sub_records = Subscription.objects.filter(
            subscription_status='active',
            current_period_end__gte=now
        ).select_related('plan')

        mrr = Decimal('0.00')
        for s in active_sub_records:
            amount = s.subscribed_amount or (s.plan.amount if s.plan else Decimal('0.00'))
            interval = s.plan.billing_interval if s.plan else 'monthly'
            if interval == 'monthly':
                mrr += amount
            elif interval == 'quarterly':
                mrr += (amount / Decimal('3.0'))
            elif interval == 'biannual':
                mrr += (amount / Decimal('6.0'))
            elif interval == 'annually':
                mrr += (amount / Decimal('12.0'))
            else:
                mrr += amount

        arr = mrr * Decimal('12.0')

        # New subscribers this month
        new_subscribers_month = Subscription.objects.filter(
            created_at__gte=month_start,
            subscription_status__in=['active', 'past_due', 'cancelled']
        ).count()

        return Response({
            "overview": {
                "total_registered_parents": total_parents,
                "total_registered_students": total_students,
                "active_subscribers": active_subs,
                "inactive_subscribers": inactive_subs,
                "past_due_subscriptions": past_due_subs,
                "cancelled_subscriptions": cancelled_subs,
                "expired_subscriptions": expired_subs,
                "total_successful_payments": total_successful_payments,
                "monthly_recurring_revenue": float(round(mrr, 2)),
                "annual_subscription_revenue": float(round(arr, 2)),
                "new_subscribers_this_month": new_subscribers_month
            }
        }, status=status.HTTP_200_OK)


class AdminSubscribersListView(APIView):
    """
    Searchable and filterable table of subscribers for Admin Dashboard.
    Supports filtering by status ('all', 'active', 'past_due', 'cancelled', 'expired')
    and searching by parent username, email, or child username.
    Route: GET /api/admin/subscriptions/subscribers/
    """
    permission_classes = [IsAdminUserOrSuperAdmin]

    def get(self, request):
        status_filter = request.query_params.get('status', 'all').lower()
        search_query = request.query_params.get('search', '').strip()
        plan_filter = request.query_params.get('plan')

        now = timezone.now()
        qs = Subscription.objects.select_related('parent', 'plan').prefetch_related('parent__parent_relations__child').all()

        if status_filter != 'all':
            if status_filter == 'active':
                qs = qs.filter(subscription_status='active', current_period_end__gte=now)
            elif status_filter == 'expired':
                qs = qs.filter(Q(subscription_status='expired') | Q(subscription_status='active', current_period_end__lt=now))
            else:
                qs = qs.filter(subscription_status=status_filter)

        if plan_filter:
            qs = qs.filter(plan_id=plan_filter)

        if search_query:
            qs = qs.filter(
                Q(parent__username__icontains=search_query) |
                Q(parent__email__icontains=search_query) |
                Q(parent__first_name__icontains=search_query) |
                Q(parent__last_name__icontains=search_query) |
                Q(parent__parent_relations__child__username__icontains=search_query)
            ).distinct()

        subscribers = []
        for s in qs[:100]:
            # Associated children
            children_names = [
                rel.child.username for rel in s.parent.parent_relations.all()
            ]

            # Last payment status
            last_pmt = s.parent.payments.order_by('-created_at').first()
            payment_status = last_pmt.payment_status if last_pmt else 'no_records'

            sub_status = s.subscription_status
            if sub_status == 'active' and s.current_period_end and s.current_period_end < now:
                sub_status = 'expired'

            subscribers.append({
                "id": s.id,
                "parent_id": s.parent.id,
                "parent_name": s.parent.get_full_name() or s.parent.username,
                "parent_email": s.parent.email,
                "associated_children": children_names,
                "children_count": len(children_names),
                "plan_name": s.plan.plan_name if s.plan else "Custom Family Plan",
                "billing_interval": s.plan.billing_interval if s.plan else "monthly",
                "subscription_amount": float(s.subscribed_amount or (s.plan.amount if s.plan else 0)),
                "payment_status": payment_status,
                "subscription_start_date": (s.subscription_start_date or s.created_at).isoformat(),
                "next_payment_date": s.next_payment_date.isoformat() if s.next_payment_date else (s.current_period_end.isoformat() if s.current_period_end else None),
                "current_period_end": s.current_period_end.isoformat() if s.current_period_end else None,
                "subscription_status": sub_status,
                "is_manual_compensation": s.is_manual_compensation,
                "manual_compensation_reason": s.manual_compensation_reason,
                "paystack_subscription_code": s.paystack_subscription_code
            })

        return Response({"subscribers": subscribers, "count": len(subscribers)}, status=status.HTTP_200_OK)


class AdminPaymentsListView(APIView):
    """
    Searchable and filterable payment transaction history for Admin Dashboard.
    Route: GET /api/admin/subscriptions/payments/
    """
    permission_classes = [IsAdminUserOrSuperAdmin]

    def get(self, request):
        search = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', 'all').lower()

        qs = Payment.objects.select_related('parent', 'subscription', 'subscription__plan').all()

        if status_filter != 'all':
            qs = qs.filter(payment_status=status_filter)

        if search:
            qs = qs.filter(
                Q(payment_reference__icontains=search) |
                Q(paystack_transaction_id__icontains=search) |
                Q(parent__username__icontains=search) |
                Q(parent__email__icontains=search)
            )

        payments = []
        for p in qs[:150]:
            payments.append({
                "id": p.id,
                "transaction_reference": p.payment_reference,
                "parent_username": p.parent.username,
                "parent_email": p.parent.email,
                "amount": float(p.amount),
                "currency": p.currency,
                "payment_date": (p.payment_date or p.created_at).isoformat(),
                "payment_method": p.payment_channel or 'card',
                "paystack_reference": p.paystack_transaction_id or p.payment_reference,
                "payment_status": p.payment_status,
                "plan_name": p.subscription.plan.plan_name if (p.subscription and p.subscription.plan) else "N/A"
            })

        return Response({"payments": payments, "count": len(payments)}, status=status.HTTP_200_OK)


class AdminPlansManageView(APIView):
    """
    Lists and creates subscription plans.
    Route: GET, POST /api/admin/subscriptions/plans/
    """
    permission_classes = [IsAdminUserOrSuperAdmin]

    def get(self, request):
        plans = SubscriptionPlan.objects.all().order_by('amount')
        plans_data = []
        for p in plans:
            sub_count = p.subscriptions.filter(subscription_status='active').count()
            plans_data.append({
                "id": p.id,
                "plan_name": p.plan_name,
                "plan_description": p.plan_description,
                "amount": float(p.amount),
                "currency": p.currency,
                "billing_interval": p.billing_interval,
                "billing_interval_display": p.get_billing_interval_display(),
                "paystack_plan_code": p.paystack_plan_code,
                "features": p.features,
                "is_active": p.is_active,
                "is_promotional": p.is_promotional,
                "promotional_price": float(p.promotional_price) if p.promotional_price else None,
                "promotional_headline": p.promotional_headline,
                "active_subscribers_count": sub_count,
                "created_at": p.created_at.isoformat()
            })
        return Response({"plans": plans_data}, status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get('plan_name', '').strip()
        amount_raw = request.data.get('amount')
        interval = request.data.get('billing_interval', 'monthly')
        description = request.data.get('plan_description', '').strip()
        features = request.data.get('features', ["all"])
        is_promotional = bool(request.data.get('is_promotional', False))
        promotional_price = request.data.get('promotional_price')
        promotional_headline = request.data.get('promotional_headline', '').strip()

        if not name or amount_raw is None:
            return Response({"error": "Plan name and amount are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(str(amount_raw))
            if amount <= 0:
                raise ValueError()
        except Exception:
            return Response({"error": "Invalid amount. Must be a positive decimal number."}, status=status.HTTP_400_BAD_REQUEST)

        promo_dec = None
        if promotional_price:
            try:
                promo_dec = Decimal(str(promotional_price))
            except Exception:
                promo_dec = None

        # Attempt to create plan on Paystack
        amount_kobo = int(amount * 100)
        ps_res = create_paystack_plan(name, amount_kobo, interval, description)
        paystack_plan_code = ps_res.get("plan_code") if ps_res.get("status") else None

        with transaction.atomic():
            plan = SubscriptionPlan.objects.create(
                plan_name=name,
                plan_description=description,
                amount=amount,
                currency='NGN',
                billing_interval=interval,
                paystack_plan_code=paystack_plan_code,
                features=features,
                is_active=True,
                is_promotional=is_promotional,
                promotional_price=promo_dec,
                promotional_headline=promotional_headline
            )

            # Audit log
            AdminAuditLog.objects.create(
                admin_user=request.user,
                action='PLAN_CREATED',
                target_model='SubscriptionPlan',
                target_id=str(plan.id),
                details={
                    "plan_name": name,
                    "amount": float(amount),
                    "billing_interval": interval,
                    "paystack_plan_code": paystack_plan_code
                },
                ip_address=get_client_ip(request)
            )

        return Response({
            "success": True,
            "message": "Subscription plan created successfully.",
            "plan_id": plan.id,
            "paystack_plan_code": paystack_plan_code
        }, status=status.HTTP_201_CREATED)


class AdminPlanDetailManageView(APIView):
    """
    Allows editing an existing plan's price, description, features, intervals, and promos.
    CRITICAL: Changing a plan's advertised price must NOT silently alter existing subscribers'
    recurring charges. Backend guarantees existing subscriptions retain their locked subscribed_amount.
    Route: PUT /api/admin/subscriptions/plans/<int:pk>/
    """
    permission_classes = [IsAdminUserOrSuperAdmin]

    def put(self, request, pk):
        plan = SubscriptionPlan.objects.filter(id=pk).first()
        if not plan:
            return Response({"error": "Subscription plan not found."}, status=status.HTTP_404_NOT_FOUND)

        old_price = float(plan.amount)
        new_price_raw = request.data.get('amount')
        name = request.data.get('plan_name', plan.plan_name).strip()
        description = request.data.get('plan_description', plan.plan_description).strip()
        interval = request.data.get('billing_interval', plan.billing_interval)
        features = request.data.get('features', plan.features)
        is_promotional = request.data.get('is_promotional', plan.is_promotional)
        promotional_price_raw = request.data.get('promotional_price')
        promotional_headline = request.data.get('promotional_headline', plan.promotional_headline).strip()

        price_changed = False
        if new_price_raw is not None:
            try:
                new_price = Decimal(str(new_price_raw))
                if new_price <= 0:
                    raise ValueError()
                if new_price != plan.amount:
                    price_changed = True
                    plan.amount = new_price
            except Exception:
                return Response({"error": "Invalid amount value."}, status=status.HTTP_400_BAD_REQUEST)

        promo_dec = None
        if promotional_price_raw:
            try:
                promo_dec = Decimal(str(promotional_price_raw))
            except Exception:
                promo_dec = None

        plan.plan_name = name
        plan.plan_description = description
        plan.billing_interval = interval
        plan.features = features
        plan.is_promotional = bool(is_promotional)
        plan.promotional_price = promo_dec
        plan.promotional_headline = promotional_headline

        # If price changed, create a new Paystack plan for future subscribers
        # so existing Paystack subscriptions on the old plan code are NOT inadvertently modified
        new_ps_code = plan.paystack_plan_code
        if price_changed:
            amount_kobo = int(plan.amount * 100)
            ps_res = create_paystack_plan(f"{name} (v2)", amount_kobo, interval, description)
            if ps_res.get("status") and ps_res.get("plan_code"):
                new_ps_code = ps_res["plan_code"]
                plan.paystack_plan_code = new_ps_code

        with transaction.atomic():
            plan.save()

            # Record detailed audit log
            AdminAuditLog.objects.create(
                admin_user=request.user,
                action='PLAN_UPDATED',
                target_model='SubscriptionPlan',
                target_id=str(plan.id),
                details={
                    "plan_id": plan.id,
                    "plan_name": name,
                    "old_price": old_price,
                    "new_price": float(plan.amount),
                    "price_changed": price_changed,
                    "new_paystack_code": new_ps_code,
                    "protection_guarantee": "Existing subscribers remain on their locked subscription rates."
                },
                ip_address=get_client_ip(request)
            )

        return Response({
            "success": True,
            "message": "Plan updated successfully. Advertised price updated without affecting existing active subscribers' recurring charges.",
            "plan": {
                "id": plan.id,
                "plan_name": plan.plan_name,
                "amount": float(plan.amount),
                "billing_interval": plan.billing_interval,
                "paystack_plan_code": plan.paystack_plan_code
            }
        }, status=status.HTTP_200_OK)


class AdminPlanToggleStatusView(APIView):
    """
    Activates or deactivates a plan from the public subscription catalog.
    Route: POST /api/admin/subscriptions/plans/<int:pk>/toggle-status/
    """
    permission_classes = [IsAdminUserOrSuperAdmin]

    def post(self, request, pk):
        plan = SubscriptionPlan.objects.filter(id=pk).first()
        if not plan:
            return Response({"error": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        plan.is_active = not plan.is_active
        plan.save(update_fields=['is_active'])

        AdminAuditLog.objects.create(
            admin_user=request.user,
            action='PLAN_STATUS_TOGGLED',
            target_model='SubscriptionPlan',
            target_id=str(plan.id),
            details={"is_active": plan.is_active},
            ip_address=get_client_ip(request)
        )

        return Response({
            "success": True,
            "is_active": plan.is_active,
            "message": f"Plan '{plan.plan_name}' is now {'active' if plan.is_active else 'deactivated'}."
        }, status=status.HTTP_200_OK)


class AdminManualCompensationView(APIView):
    """
    Authorised Manual-Compensation Process.
    Strictly prohibits marking an account paid without either:
    1. A verified gateway payment, OR
    2. A properly documented, authorised manual compensation with required justification.
    Route: POST /api/admin/subscriptions/<int:pk>/manual-compensation/
    """
    permission_classes = [IsAdminUserOrSuperAdmin]

    def post(self, request, pk):
        sub = Subscription.objects.select_related('parent', 'plan').filter(id=pk).first()
        if not sub:
            return Response({"error": "Subscription not found."}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get('justification_reason', '').strip()
        duration_days = request.data.get('duration_days')

        # Strict validation: reason cannot be empty or trivial
        if not reason or len(reason) < 10:
            return Response({
                "error": "A thorough justification reason (at least 10 characters) is strictly required to grant manual compensation without gateway verification."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            days = int(duration_days) if duration_days else 30
            if days <= 0 or days > 365:
                raise ValueError()
        except Exception:
            return Response({"error": "duration_days must be an integer between 1 and 365."}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        new_end_date = now + timedelta(days=days)
        if sub.current_period_end and sub.current_period_end > now:
            new_end_date = sub.current_period_end + timedelta(days=days)

        with transaction.atomic():
            sub.subscription_status = 'active'
            sub.current_period_start = now
            sub.current_period_end = new_end_date
            sub.next_payment_date = new_end_date
            sub.grace_period_end = None
            sub.cancellation_date = None
            sub.is_manual_compensation = True
            sub.manual_compensation_reason = reason
            sub.manual_compensated_by = request.user
            sub.save()

            # Record in immutable AdminAuditLog
            AdminAuditLog.objects.create(
                admin_user=request.user,
                action='SUBSCRIPTION_MANUAL_COMPENSATION_GRANTED',
                target_model='Subscription',
                target_id=str(sub.id),
                details={
                    "parent_username": sub.parent.username,
                    "parent_email": sub.parent.email,
                    "days_granted": days,
                    "new_period_end": new_end_date.isoformat(),
                    "justification_reason": reason,
                    "authorized_by": request.user.username
                },
                ip_address=get_client_ip(request)
            )

        return Response({
            "success": True,
            "message": f"Manual compensation granted for {days} days. Documented in audit log.",
            "subscription_id": sub.id,
            "current_period_end": new_end_date.isoformat()
        }, status=status.HTTP_200_OK)


class AdminAuditLogsListView(APIView):
    """
    Returns administrative audit logs for subscription and pricing actions.
    Route: GET /api/admin/subscriptions/audit-logs/
    """
    permission_classes = [IsAdminUserOrSuperAdmin]

    def get(self, request):
        logs = AdminAuditLog.objects.select_related('admin_user').all()[:100]
        data = [
            {
                "id": lg.id,
                "admin_username": lg.admin_user.username,
                "admin_email": lg.admin_user.email,
                "action": lg.action,
                "target_model": lg.target_model,
                "target_id": lg.target_id,
                "details": lg.details,
                "ip_address": lg.ip_address,
                "created_at": lg.created_at.isoformat()
            }
            for lg in logs
        ]
        return Response({"audit_logs": data}, status=status.HTTP_200_OK)


class AdminSubscriptionSettingsView(APIView):
    """
    Manages platform subscription configuration, notably the administrator-configurable
    grace period for failed renewals.
    Route: GET, PUT /api/admin/subscriptions/settings/
    """
    permission_classes = [IsAdminUserOrSuperAdmin]

    def get(self, request):
        grace_days = SubscriptionSetting.get_grace_period_days()
        setting_obj = SubscriptionSetting.objects.filter(key='grace_period_days').first()
        return Response({
            "grace_period_days": grace_days,
            "default_grace_days": 3,
            "updated_at": setting_obj.updated_at.isoformat() if setting_obj else None,
            "description": "Number of days child retains learning access following a recurring invoice payment failure."
        }, status=status.HTTP_200_OK)

    def put(self, request):
        days_raw = request.data.get('grace_period_days')
        if days_raw is None:
            return Response({"error": "grace_period_days is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            days = int(days_raw)
            if days < 1 or days > 30:
                raise ValueError()
        except Exception:
            return Response({"error": "grace_period_days must be an integer between 1 and 30 days."}, status=status.HTTP_400_BAD_REQUEST)

        old_days = SubscriptionSetting.get_grace_period_days()

        setting_obj, _ = SubscriptionSetting.objects.update_or_create(
            key='grace_period_days',
            defaults={
                "value": str(days),
                "description": "Grace period in days for failed recurring renewals"
            }
        )

        AdminAuditLog.objects.create(
            admin_user=request.user,
            action='GRACE_PERIOD_UPDATED',
            target_model='SubscriptionSetting',
            target_id=str(setting_obj.id),
            details={
                "previous_grace_period_days": old_days,
                "new_grace_period_days": days
            },
            ip_address=get_client_ip(request)
        )

        return Response({
            "success": True,
            "grace_period_days": days,
            "message": f"Grace period successfully updated to {days} days."
        }, status=status.HTTP_200_OK)


class AdminProcessRenewalsView(APIView):
    """
    Triggerable sweep endpoint to identify and process expired subscriptions.
    Preserves child projects, XP, badges, and learning history.
    Route: POST /api/admin/subscriptions/process-renewals/
    """
    permission_classes = [IsAdminUserOrSuperAdmin]

    def post(self, request):
        result = process_expired_subscriptions()

        AdminAuditLog.objects.create(
            admin_user=request.user,
            action='RENEWALS_SWEEP_EXECUTED',
            target_model='Subscription',
            target_id='batch',
            details=result,
            ip_address=get_client_ip(request)
        )

        return Response({
            "success": True,
            "result": result
        }, status=status.HTTP_200_OK)

