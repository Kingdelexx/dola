import os
import sys
import dotenv

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

key = os.environ.get("RESEND_API_KEY")
from_email = os.environ.get("DEFAULT_FROM_EMAIL", "DolaCode <no-reply@dolacode.com.ng>")
print("Loaded key:", key)
print("Loaded from_email:", from_email)

import resend
resend.api_key = key

target_emails = [
    "devnaijaacademy@gmail.com",
    "test_school_user@gmail.com",
    "some_other_school@yahoo.com"
]

for email in target_emails:
    print(f"\nAttempting to send email to {email}...")
    try:
        resp = resend.Emails.send({
            "from": from_email,
            "to": [email],
            "subject": "Test School Email Delivery",
            "html": "<p>Testing Resend delivery to school email</p>"
        })
        print(f"SUCCESS for {email}:", resp)
    except Exception as e:
        print(f"FAILED for {email}:", type(e), e)
