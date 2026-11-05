import hmac
import hashlib
import httpx
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def get_base_url() -> str:
    url = getattr(settings, 'PAYSTACK_BASE_URL', 'https://api.paystack.co') or 'https://api.paystack.co'
    return url.rstrip('/')


def get_secret_key() -> str:
    key = getattr(settings, 'PAYSTACK_SECRET_KEY', '') or ''
    if not key or not key.strip():
        key = os.environ.get('PAYSTACK_SECRET_KEY', '') or "sk_test_b25287325f36bacd82ed2e69ff3eb9df4f6acd54"
    return key.strip()


def get_public_key() -> str:
    key = getattr(settings, 'PAYSTACK_PUBLIC_KEY', '') or ''
    if not key or not key.strip():
        key = os.environ.get('PAYSTACK_PUBLIC_KEY', '') or "pk_test_55ce37cbca78414b4ab56ed6a070aadfba2b3f98"
    return key.strip()


def get_headers() -> dict:
    return {
        "Authorization": f"Bearer {get_secret_key()}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }


def initialize_transaction(
    email: str,
    amount_kobo: int,
    reference: str,
    callback_url: str,
    metadata: dict = None,
    plan_code: str = None
) -> dict:
    """
    Initializes a transaction with Paystack.
    Amount is strictly in Kobo (NGN 1 = 100 Kobo).
    """
    secret_key = get_secret_key()
    if not secret_key:
        logger.error("PAYSTACK_SECRET_KEY is not configured.")
        return {
            "status": False,
            "message": "Payment provider is not properly configured on server."
        }

    payload = {
        "email": email,
        "amount": amount_kobo,
        "reference": reference,
        "callback_url": callback_url,
    }

    if metadata:
        payload["metadata"] = metadata

    if plan_code:
        payload["plan"] = plan_code

    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.post(
                f"{get_base_url()}/transaction/initialize",
                headers=get_headers(),
                json=payload
            )
            data = response.json()
            if response.status_code == 200 and data.get("status"):
                return {
                    "status": True,
                    "authorization_url": data["data"]["authorization_url"],
                    "access_code": data["data"]["access_code"],
                    "reference": data["data"]["reference"]
                }
            else:
                msg = data.get("message", "Payment initialization failed.")
                logger.error(f"Paystack initialize error: {msg} (Status: {response.status_code})")
                return {
                    "status": False,
                    "message": msg
                }
    except Exception as e:
        logger.exception(f"Exception during Paystack transaction initialization: {e}")
        return {
            "status": False,
            "message": f"Network error connecting to payment gateway: {str(e)}"
        }


def verify_transaction(reference: str) -> dict:
    """
    Verifies a transaction reference directly against Paystack's API.
    """
    secret_key = get_secret_key()
    if not secret_key:
        return {
            "status": False,
            "message": "PAYSTACK_SECRET_KEY is not configured."
        }

    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.get(
                f"{get_base_url()}/transaction/verify/{reference}",
                headers=get_headers()
            )
            data = response.json()
            if response.status_code == 200 and data.get("status"):
                tx_data = data.get("data", {})
                is_success = tx_data.get("status") == "success"
                return {
                    "status": is_success,
                    "verified": True,
                    "data": tx_data,
                    "message": tx_data.get("gateway_response", "Verification completed.")
                }
            else:
                return {
                    "status": False,
                    "verified": False,
                    "message": data.get("message", "Transaction not found or unverified.")
                }
    except Exception as e:
        logger.exception(f"Exception during Paystack verification: {e}")
        return {
            "status": False,
            "verified": False,
            "message": f"Network error verifying transaction: {str(e)}"
        }


def verify_webhook_signature(raw_body: bytes, signature_header: str) -> bool:
    """
    Validates Paystack HMAC SHA512 signature on incoming webhook requests.
    """
    secret = getattr(settings, 'PAYSTACK_WEBHOOK_SECRET', '') or get_secret_key()
    if not secret or not signature_header:
        return False

    computed = hmac.new(
        secret.encode('utf-8'),
        msg=raw_body,
        digestmod=hashlib.sha512
    ).hexdigest()

    return hmac.compare_digest(computed.lower(), signature_header.lower())


def disable_subscription(code: str, email_token: str) -> dict:
    """
    Disables a recurring subscription on Paystack.
    """
    secret_key = get_secret_key()
    if not secret_key or not code:
        return {"status": False, "message": "Missing credentials or subscription code"}

    payload = {
        "code": code,
        "token": email_token or ""
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                f"{get_base_url()}/subscription/disable",
                headers=get_headers(),
                json=payload
            )
            return response.json()
    except Exception as e:
        logger.exception(f"Error disabling subscription on Paystack: {e}")
        return {"status": False, "message": str(e)}


def generate_subscription_manage_link(code: str) -> dict:
    """
    Generates a link where a parent can update their card details on Paystack.
    Endpoint: GET /subscription/{code}/manage/link
    """
    secret_key = get_secret_key()
    if not secret_key or not code:
        return {"status": False, "message": "Missing credentials or subscription code"}

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.get(
                f"{get_base_url()}/subscription/{code}/manage/link",
                headers=get_headers()
            )
            data = response.json()
            if response.status_code == 200 and data.get("status"):
                link = data.get("data", {}).get("link")
                return {"status": True, "link": link}
            else:
                return {"status": False, "message": data.get("message", "Unable to generate management link")}
    except Exception as e:
        logger.exception(f"Error generating Paystack subscription manage link: {e}")
        return {"status": False, "message": str(e)}


def send_subscription_manage_email(code: str) -> dict:
    """
    Sends an email to the subscriber with a link to update their payment method on Paystack.
    Endpoint: POST /subscription/{code}/manage/email
    """
    secret_key = get_secret_key()
    if not secret_key or not code:
        return {"status": False, "message": "Missing credentials or subscription code"}

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                f"{get_base_url()}/subscription/{code}/manage/email",
                headers=get_headers()
            )
            return response.json()
    except Exception as e:
        logger.exception(f"Error sending Paystack subscription manage email: {e}")
        return {"status": False, "message": str(e)}


def create_paystack_plan(name: str, amount_kobo: int, interval: str, description: str = "") -> dict:
    """
    Creates a new plan on Paystack.
    Endpoint: POST /plan
    """
    secret_key = get_secret_key()
    if not secret_key:
        return {"status": False, "message": "PAYSTACK_SECRET_KEY is not configured"}

    # Map interval to Paystack format
    interval_map = {
        'monthly': 'monthly',
        'quarterly': 'quarterly',
        'biannual': 'biannually',
        'biannually': 'biannually',
        'annually': 'annually',
        'yearly': 'annually'
    }
    ps_interval = interval_map.get(interval.lower(), 'monthly')

    payload = {
        "name": name,
        "amount": amount_kobo,
        "interval": ps_interval,
        "description": description or f"DolaCode {name}"
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                f"{get_base_url()}/plan",
                headers=get_headers(),
                json=payload
            )
            data = response.json()
            if response.status_code in [200, 201] and data.get("status"):
                plan_code = data.get("data", {}).get("plan_code")
                return {"status": True, "plan_code": plan_code, "data": data.get("data")}
            else:
                return {"status": False, "message": data.get("message", "Failed to create plan on Paystack")}
    except Exception as e:
        logger.exception(f"Error creating plan on Paystack: {e}")
        return {"status": False, "message": str(e)}

