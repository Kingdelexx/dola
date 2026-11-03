from rest_framework.views import exception_handler
from rest_framework.exceptions import PermissionDenied, NotAuthenticated
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Standardizes error responses across DolaCode API endpoints.
    Ensures permission and subscription rejections return:
    - HTTP 403
    - Error code: 'subscription_required'
    - Required headline, subtext, and CTA buttons
    """
    response = exception_handler(exc, context)

    if response is not None:
        if isinstance(exc, (PermissionDenied, NotAuthenticated)):
            # If exc.detail is a dict from RequiresActiveSubscription, hoist fields to top level
            detail_data = response.data.get('detail')
            if isinstance(detail_data, dict):
                response.data.update(detail_data)
                # Ensure canonical error and code are 'subscription_required'
                response.data['error'] = 'subscription_required'
                response.data['code'] = 'subscription_required'
            else:
                # String detail or standard DRF permission denied
                detail_str = str(detail_data or "Subscription required to access this resource.")
                response.data['error'] = 'subscription_required'
                response.data['code'] = 'subscription_required'
                response.data['detail'] = detail_str
                response.data.setdefault('headline', 'Your DolaCode adventure is waiting!')
                response.data.setdefault('subtext', 'Ask your parent to unlock your learning world.')
                response.data.setdefault('cta_text', 'UNLOCK DOLACODE')
                response.data.setdefault('cta_url', '/subscribe')
                response.data.setdefault('status', 'inactive')

            if isinstance(exc, PermissionDenied):
                response.status_code = status.HTTP_403_FORBIDDEN

    return response
