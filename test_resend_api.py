import os
import sys
import dotenv

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

key = os.environ.get("RESEND_API_KEY")
print("Loaded RESEND_API_KEY:", key)

import resend
resend.api_key = key

try:
    from_email = os.environ.get("DEFAULT_FROM_EMAIL", "DolaCode <hello@dolacode.com.ng>")
    resp = resend.Emails.send({
        "from": from_email,
        "to": ["devnaijaacademy@gmail.com"],
        "subject": "Resend Live Test Email to Account Owner",
        "html": "<h1>Test Live Email Delivery</h1><p>School Welcome & Approval notification test!</p>"
    })
    print("RESEND API DELIVERED SUCCESSFULLY! Response:", resp)
except Exception as e:
    print("Resend Exception:", type(e), e)
