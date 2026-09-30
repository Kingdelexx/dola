import os
import sys
import dotenv

env_path = r"c:\Users\HP\Desktop\project\dola\backend\.env"
dotenv.load_dotenv(env_path)

key = os.environ.get("RESEND_API_KEY")
from_email = os.environ.get("DEFAULT_FROM_EMAIL")

print("Key loaded:", key)
print("From email:", from_email)

import resend
resend.api_key = key

try:
    resp = resend.Emails.send({
        "from": from_email,
        "to": ["testrecip1234567@gmail.com"],
        "subject": "Testing Email Delivery To External Address",
        "html": "<p>This is a test email to external recipient.</p>"
    })
    print("SUCCESS:", resp)
except Exception as e:
    print("RESEND ERROR:", type(e), e)
