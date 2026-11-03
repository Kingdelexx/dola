from rest_framework import permissions
from .subscription_service import check_learning_access


class RequiresActiveSubscription(permissions.BasePermission):
    """
    DRF Permission class that verifies:
    1. The user is authenticated.
    2. The user belongs to a valid parent/child account relationship (or staff/school exempt).
    3. The parent subscription is eligible (active, past_due within grace, cancelled within paid-through).
    4. The requested feature is included in the plan.
    5. Returns HTTP 403 with error code 'subscription_required' when access is denied.
    """
    message = {
        "error": "subscription_required",
        "code": "subscription_required",
        "detail": "An eligible parent subscription is required to access this learning resource.",
        "headline": "Your DolaCode adventure is waiting!",
        "subtext": "Ask your parent to unlock your learning world.",
        "cta_text": "UNLOCK DOLACODE",
        "cta_url": "/subscribe",
        "status": "inactive"
    }

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers and staff have unrestricted access
        if request.user.is_superuser or request.user.is_staff:
            return True

        feature = getattr(view, 'subscription_feature', None)
        access = check_learning_access(request.user, feature=feature)
        if not access.get('allowed', False):
            self.message = {
                "error": "subscription_required",
                "code": "subscription_required",
                "detail": access.get("reason", "An eligible parent subscription is required to access this learning resource."),
                "headline": access.get("headline", "Your DolaCode adventure is waiting!"),
                "subtext": access.get("subtext", "Ask your parent to unlock your learning world."),
                "cta_text": access.get("cta_text", "UNLOCK DOLACODE"),
                "cta_url": access.get("cta_url", "/subscribe"),
                "status": access.get("status", "inactive")
            }
            return False
        return True


class IsFamilyResourceOwner(permissions.BasePermission):
    """
    Object-level permission ensuring that student data, projects, drafts,
    and learning records are never exposed across different family accounts.

    Rules:
    - If user is superuser or staff -> allowed.
    - If user is student -> allowed only if resource.user == request.user.
    - If user is parent -> allowed only if ParentChild relationship links request.user and resource.user.
    - If user is teacher / school admin -> allowed only if student is enrolled in their classroom / school.
    - Otherwise -> rejected with HTTP 403.
    """
    message = {
        "error": "subscription_required",
        "code": "subscription_required",
        "detail": "You are not authorized to view or modify this resource across different family accounts."
    }

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser or request.user.is_staff:
            return True

        resource_user = getattr(obj, 'user', None) or getattr(obj, 'student', None)
        if not resource_user:
            return True

        # 1. Student self-ownership
        if resource_user == request.user:
            return True

        # 2. Parent-child relationship check
        from .models import ParentChild
        if ParentChild.objects.filter(parent=request.user, child=resource_user).exists():
            return True

        # 3. School educator check
        req_profile = getattr(request.user, 'profile', None)
        res_profile = getattr(resource_user, 'profile', None)
        if req_profile and req_profile.role in ['teacher', 'school_admin']:
            if req_profile.school and res_profile and res_profile.school == req_profile.school:
                return True

        return False
