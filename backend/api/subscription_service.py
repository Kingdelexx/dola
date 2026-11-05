from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.contrib.auth.models import User
from .models import (
    SubscriptionPlan, Subscription, Payment, WebhookEvent, ParentChild
)
import logging

logger = logging.getLogger(__name__)


def seed_default_plans():
    """
    Ensures standard DolaCode subscription plans exist with accurate prices and active Paystack codes.
    """
    # 1. Monthly Plan -> 10,000 NGN
    monthly = SubscriptionPlan.objects.filter(billing_interval='monthly').first()
    if monthly:
        needs_save = False
        if monthly.amount != 10000.00 or monthly.paystack_plan_code != 'PLN_dmt3enn7u1045sx' or not monthly.is_active:
            monthly.amount = 10000.00
            monthly.plan_name = "Monthly Explorer"
            monthly.paystack_plan_code = "PLN_dmt3enn7u1045sx"
            monthly.is_active = True
            needs_save = True
        if needs_save:
            monthly.save()
    else:
        SubscriptionPlan.objects.create(
            plan_name="Monthly Explorer",
            plan_description="Full access to all 4 coding worlds, 6 interactive numeracy games, and Lizzy AI tutor for all linked children.",
            amount=10000.00,
            currency="NGN",
            billing_interval="monthly",
            paystack_plan_code="PLN_dmt3enn7u1045sx",
            features=["numeracy", "block_coding", "python_quest", "app_studio", "web_studio", "premium_content"],
            is_active=True
        )

    # 2. Annual Plan -> 100,000 NGN
    annual = SubscriptionPlan.objects.filter(billing_interval='annually').first()
    if annual:
        needs_save = False
        if annual.amount != 100000.00 or annual.paystack_plan_code != 'PLN_27x0pbe5znqyzte' or not annual.is_active:
            annual.amount = 100000.00
            annual.plan_name = "Annual Champion (1 Year)"
            annual.paystack_plan_code = "PLN_27x0pbe5znqyzte"
            annual.is_active = True
            needs_save = True
        if needs_save:
            annual.save()
    else:
        SubscriptionPlan.objects.create(
            plan_name="Annual Champion (1 Year)",
            plan_description="Best value for full-year coding mastery! Covers all coding stages, game studios, and weekly AI progress reports. Save ₦20,000 (2 months free).",
            amount=100000.00,
            currency="NGN",
            billing_interval="annually",
            paystack_plan_code="PLN_27x0pbe5znqyzte",
            features=["numeracy", "block_coding", "python_quest", "app_studio", "web_studio", "premium_content"],
            is_active=True
        )

    # 3. Deactivate legacy quarterly/termly plans from active public selection
    SubscriptionPlan.objects.filter(billing_interval='quarterly', is_active=True).update(is_active=False)
    logger.info("Default DolaCode subscription plans verified and active.")


@transaction.atomic
def activate_subscription(parent_user: User, plan: SubscriptionPlan, payment_record: Payment,
                          paystack_sub_code=None, paystack_email_token: str = None,
                          customer_code: str = None) -> Subscription:
    """
    Activates or renews a subscription for a parent user.
    Supports either explicit string arguments or a raw Paystack tx_data dict as 4th argument.
    """
    now = timezone.now()

    # If 4th argument is tx_data dictionary from Paystack
    if isinstance(paystack_sub_code, dict):
        tx_data = paystack_sub_code
        customer_code = (tx_data.get('customer') or {}).get('customer_code') or customer_code
        auth_info = tx_data.get('authorization') or {}
        paystack_email_token = auth_info.get('authorization_code') or paystack_email_token
        paystack_sub_code = tx_data.get('subscription_code') or tx_data.get('plan') or None

        payment_record.payment_status = 'success'
        if tx_data.get('id'):
            payment_record.paystack_transaction_id = str(tx_data['id'])
        if auth_info.get('channel'):
            payment_record.payment_channel = auth_info['channel']
        payment_record.payment_date = now
        payment_record.save()
    else:
        payment_record.payment_status = 'success'
        payment_record.payment_date = now
        payment_record.save()

    # Calculate period end based on plan interval
    if plan.billing_interval == 'monthly':
        period_end = now + timedelta(days=30)
    elif plan.billing_interval == 'quarterly':
        period_end = now + timedelta(days=90)
    elif plan.billing_interval == 'biannual':
        period_end = now + timedelta(days=180)
    elif plan.billing_interval == 'annually':
        period_end = now + timedelta(days=365)
    else:
        period_end = now + timedelta(days=30)

    # Check for existing active or past_due subscription
    sub = Subscription.objects.select_for_update().filter(
        parent=parent_user,
        subscription_status__in=['active', 'past_due', 'cancelled', 'inactive', 'expired']
    ).order_by('-current_period_end').first()

    if sub:
        # If subscription was still valid in the future, extend it
        if sub.current_period_end and sub.current_period_end > now:
            period_end = sub.current_period_end + (period_end - now)

        sub.plan = plan
        sub.subscription_status = 'active'
        sub.current_period_start = now
        sub.current_period_end = period_end
        sub.next_payment_date = period_end
        sub.grace_period_end = None
        sub.cancellation_date = None
        sub.subscribed_amount = payment_record.amount if payment_record and payment_record.amount else plan.amount

        if paystack_sub_code:
            sub.paystack_subscription_code = paystack_sub_code
        if paystack_email_token:
            sub.paystack_email_token = paystack_email_token
        if customer_code:
            sub.paystack_customer_code = customer_code

        sub.save()
    else:
        sub = Subscription.objects.create(
            parent=parent_user,
            plan=plan,
            subscription_status='active',
            paystack_customer_code=customer_code,
            paystack_subscription_code=paystack_sub_code,
            paystack_email_token=paystack_email_token,
            subscription_start_date=now,
            subscribed_amount=payment_record.amount if payment_record and payment_record.amount else plan.amount,
            current_period_start=now,
            current_period_end=period_end,
            next_payment_date=period_end
        )

    if not payment_record.subscription:
        payment_record.subscription = sub
        payment_record.save(update_fields=['subscription'])

    logger.info(f"Subscription #{sub.id} activated for parent {parent_user.username}. Valid until {sub.current_period_end}")
    return sub


# Alias for compatibility with payment_views and webhook handlers
activate_or_renew_subscription = activate_subscription


def is_student_accessible(student_user: User, include_model: bool = False) -> dict:
    """
    Evaluates learning access rights for a user account (student or parent).
    Verifies:
      1. Authentication
      2. Valid parent/child account relationship (or staff / educator / school exempt)
      3. Parent subscription eligibility (active, past_due within grace, cancelled within paid-through)
    """
    if not student_user or not student_user.is_authenticated:
        res = {
            "has_access": False,
            "reason": "Authentication required",
            "plan_name": "None",
            "status": "unauthenticated",
            "expires_at": None,
            "subscription_id": None
        }
        if include_model:
            res["subscription_model"] = None
        return res

    # Staff & Admin Preview Exemption
    if student_user.is_superuser or student_user.is_staff:
        res = {
            "has_access": True,
            "reason": "Administrative access",
            "plan_name": "Super Admin Preview",
            "status": "active",
            "expires_at": None,
            "subscription_id": None
        }
        if include_model:
            res["subscription_model"] = None
        return res

    profile = getattr(student_user, 'profile', None)
    if profile and profile.role in ['teacher', 'school_admin', 'super_admin']:
        res = {
            "has_access": True,
            "reason": f"Educator role ({profile.role})",
            "plan_name": "Educator License",
            "status": "active",
            "expires_at": None,
            "subscription_id": None
        }
        if include_model:
            res["subscription_model"] = None
        return res

    # Institutional School Exemption:
    if profile and profile.school and profile.school.status == 'APPROVED' and profile.classroom:
        res = {
            "has_access": True,
            "reason": f"Enrolled in {profile.school.name}",
            "plan_name": f"{profile.school.name} Student License",
            "status": "active",
            "expires_at": None,
            "subscription_id": None
        }
        if include_model:
            res["subscription_model"] = None
        return res

    # Direct Parent Account Check:
    if profile and profile.role == 'parent':
        sub = Subscription.objects.filter(
            parent=student_user,
            subscription_status__in=['active', 'past_due', 'cancelled', 'expired']
        ).select_related('plan').order_by('-current_period_end').first()

        if sub and sub.is_valid():
            res = {
                "has_access": True,
                "reason": "Parent subscription active",
                "plan_name": sub.plan.plan_name if sub.plan else "Family Membership",
                "status": sub.subscription_status,
                "expires_at": sub.current_period_end.isoformat() if sub.current_period_end else None,
                "subscription_id": sub.id
            }
            if include_model:
                res["subscription_model"] = sub
            return res
        elif sub:
            expired_status = 'past_due' if sub.subscription_status == 'past_due' else 'expired'
            res = {
                "has_access": False,
                "reason": f"Subscription {sub.subscription_status}",
                "plan_name": sub.plan.plan_name if sub.plan else "Family Membership",
                "status": expired_status,
                "expires_at": sub.current_period_end.isoformat() if sub.current_period_end else None,
                "subscription_id": sub.id
            }
            if include_model:
                res["subscription_model"] = sub
            return res
        else:
            res = {
                "has_access": False,
                "reason": "Parent has no active subscription",
                "plan_name": "None",
                "status": "inactive",
                "expires_at": None,
                "subscription_id": None
            }
            if include_model:
                res["subscription_model"] = None
            return res

    # Student Family Check:
    # 1. Must belong to a valid parent/child relationship
    parent_links = ParentChild.objects.filter(child=student_user).select_related('parent')
    if not parent_links.exists():
        res = {
            "has_access": False,
            "reason": "Student account must be linked to a parent account",
            "plan_name": "Independent Learner (Unlinked)",
            "status": "inactive",
            "expires_at": None,
            "subscription_id": None
        }
        if include_model:
            res["subscription_model"] = None
        return res

    # 2. Check linked parents' subscriptions
    latest_sub = None
    for link in parent_links:
        sub = Subscription.objects.filter(
            parent=link.parent,
            subscription_status__in=['active', 'past_due', 'cancelled', 'expired']
        ).select_related('plan').order_by('-current_period_end').first()

        if sub:
            if latest_sub is None or (sub.current_period_end and (not latest_sub.current_period_end or sub.current_period_end > latest_sub.current_period_end)):
                latest_sub = sub

            if sub.is_valid():
                res = {
                    "has_access": True,
                    "reason": f"Covered by parent subscription ({link.parent.username})",
                    "plan_name": sub.plan.plan_name if sub.plan else "Family Membership",
                    "status": sub.subscription_status,
                    "expires_at": sub.current_period_end.isoformat() if sub.current_period_end else None,
                    "subscription_id": sub.id
                }
                if include_model:
                    res["subscription_model"] = sub
                return res

    if latest_sub:
        expired_status = 'past_due' if latest_sub.subscription_status == 'past_due' else 'expired'
        res = {
            "has_access": False,
            "reason": f"Parent subscription {latest_sub.subscription_status}",
            "plan_name": latest_sub.plan.plan_name if latest_sub.plan else "Family Membership",
            "status": expired_status,
            "expires_at": latest_sub.current_period_end.isoformat() if latest_sub.current_period_end else None,
            "subscription_id": latest_sub.id
        }
        if include_model:
            res["subscription_model"] = latest_sub
        return res

    # Default: Parent has never subscribed
    res = {
        "has_access": False,
        "reason": "Active parent subscription required for learning access",
        "plan_name": "Independent Learner (Unpaid)",
        "status": "inactive",
        "expires_at": None,
        "subscription_id": None
    }
    if include_model:
        res["subscription_model"] = None
    return res


def normalize_feature_category(feature: str, stage: int = None) -> str:
    """
    Maps feature names or stage numbers to standard feature categories:
    'numeracy', 'block_coding', 'app_studio', 'python_quest', 'web_studio', 'premium_content'.
    """
    if not feature and stage is not None:
        if stage == 1:
            return 'numeracy'
        elif stage == 2:
            return 'block_coding'
        elif stage == 3:
            return 'app_studio'
        elif stage == 4:
            return 'python_quest'

    if not feature:
        return 'all'

    f = feature.lower().strip()
    if f in ['stage1', 'stage1_parts', 'stage1_games', 'numeracy', 'pizza-shop', 'robot-maze', 'my-little-shop', 'frog-adventure', 'traffic-rescue', 'pet-rescue']:
        return 'numeracy'
    if f in ['stage2', 'block_coding', 'block-coding', 'blockly']:
        return 'block_coding'
    if f in ['stage3', 'app_studio', 'app-studio', 'appstudio']:
        return 'app_studio'
    if f in ['stage4', 'python_quest', 'python-quest', 'python', 'python_execution']:
        return 'python_quest'
    if f in ['web_studio', 'web-studio', 'webdev']:
        return 'web_studio'
    if f in ['premium_content', 'curriculum', 'premium']:
        return 'premium_content'

    return f


def check_learning_access(user: User, feature: str = None, stage: int = None, part: int = None) -> dict:
    """
    Comprehensive access evaluator for DolaCode learning features.
    
    Access Rules:
    - PUBLIC / SAMPLE ACCESS: Stage 1 Chapter 1 (Part 1 Number Sense) is always free.
    - ACTIVE SUBSCRIPTION: Full access to all features included in the plan.
    - PAST_DUE: Access allowed during configured grace period (3 days).
    - CANCELLED: Access allowed until paid-through date (current_period_end).
    - EXPIRED / INACTIVE: Locked paywall display with error code 'subscription_required'.
    """
    # 1. Sample lesson check: Stage 1 Part 1 (Chapter 1) is always free
    is_sample_lesson = (
        feature in ['stage1_part1', 'stage1_chapter1', 'sample_lesson'] or
        (stage == 1 and part == 1) or
        (feature == 'stage1' and (part == 1 or part is None))
    )

    if is_sample_lesson and (part == 1 or feature in ['stage1_part1', 'stage1_chapter1']):
        return {
            "allowed": True,
            "status": "sample_access",
            "is_sample": True,
            "reason": "Stage 1 Chapter 1 is a free public sample lesson",
            "headline": "Free Sample Lesson",
            "subtext": "You are exploring Stage 1 Chapter 1 (Number Sense Foundation).",
            "cta_text": "UNLOCK FULL ADVENTURE",
            "cta_url": "/subscribe"
        }

    # 2. Evaluate student / user account access rights
    access_info = is_student_accessible(user, include_model=True)
    sub = access_info.pop("subscription_model", None)

    if access_info.get("has_access", False):
        # 3. Plan feature inclusion check:
        # If covered by a subscription, check if the specific feature is included in the plan
        if sub and sub.plan:
            category = normalize_feature_category(feature, stage)
            if not sub.plan.is_feature_included(category):
                return {
                    "allowed": False,
                    "status": "plan_restricted",
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "reason": f"Feature '{category}' is not included in the {sub.plan.plan_name} plan.",
                    "headline": "Upgrade to Unlock Feature",
                    "subtext": f"Your current plan does not include {category}. Ask your parent to upgrade.",
                    "cta_text": "UPGRADE PLAN",
                    "cta_url": "/subscribe"
                }

        return {
            "allowed": True,
            "status": access_info.get("status", "active"),
            "reason": access_info.get("reason", "Subscription active"),
            "plan_name": access_info.get("plan_name", "Family Membership"),
            "expires_at": access_info.get("expires_at"),
            "headline": "Welcome back!",
            "subtext": "Your learning adventure is unlocked.",
            "cta_text": "START CODING",
            "cta_url": "/dashboard"
        }

    # 4. Paywall required: Student is unpaid, inactive, unlinked, or expired
    status = access_info.get("status", "inactive")
    return {
        "allowed": False,
        "status": status,
        "error": "subscription_required",
        "code": "subscription_required",
        "reason": access_info.get("reason", "An eligible parent subscription is required to access this resource"),
        "headline": "Your DolaCode adventure is waiting!",
        "subtext": "Ask your parent to unlock your learning world.",
        "cta_text": "UNLOCK DOLACODE",
        "cta_url": "/subscribe"
    }


def process_expired_subscriptions() -> dict:
    """
    Reliable sweep job to identify and transition expired subscriptions.
    Preserves all child projects, progress, XP, and badges.
    Never deletes student accounts or learning history.
    """
    now = timezone.now()
    expired_count = 0
    past_due_count = 0

    from .models import Subscription, SubscriptionSetting

    # 1. Past-due subscriptions where grace period has elapsed
    past_due_elapsed = Subscription.objects.filter(
        subscription_status='past_due',
        grace_period_end__lt=now
    )
    for sub in past_due_elapsed:
        sub.subscription_status = 'expired'
        sub.save(update_fields=['subscription_status'])
        expired_count += 1
        logger.info(f"Subscription #{sub.id} transitioned from past_due to expired (grace period elapsed).")

    # 2. Cancelled subscriptions where paid-through date has elapsed
    cancelled_elapsed = Subscription.objects.filter(
        subscription_status='cancelled',
        current_period_end__lt=now
    )
    for sub in cancelled_elapsed:
        sub.subscription_status = 'expired'
        sub.save(update_fields=['subscription_status'])
        expired_count += 1
        logger.info(f"Subscription #{sub.id} transitioned from cancelled to expired (paid-through period elapsed).")

    # 3. Active subscriptions whose current_period_end has elapsed
    active_elapsed = Subscription.objects.filter(
        subscription_status='active',
        current_period_end__lt=now
    )
    for sub in active_elapsed:
        if sub.paystack_subscription_code:
            grace_days = SubscriptionSetting.get_grace_period_days()
            sub.subscription_status = 'past_due'
            sub.grace_period_end = now + timedelta(days=grace_days)
            sub.save(update_fields=['subscription_status', 'grace_period_end'])
            past_due_count += 1
            logger.info(f"Subscription #{sub.id} marked past_due with {grace_days}-day grace awaiting renewal.")
        else:
            sub.subscription_status = 'expired'
            sub.save(update_fields=['subscription_status'])
            expired_count += 1
            logger.info(f"Subscription #{sub.id} transitioned from active to expired (period elapsed).")

    return {
        "timestamp": now.isoformat(),
        "expired_count": expired_count,
        "past_due_count": past_due_count,
        "preservation_status": "All child projects, XP, badges, and learning history remain 100% intact."
    }

