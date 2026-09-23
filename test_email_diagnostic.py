import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

import django
django.setup()

from api.models import School
from api.emails import send_school_registration_email, send_school_approval_email

print("Testing School Registration Email...")
dummy_school = School(name="Greenwood International Academy", code="SCH-GW9922")
result_reg = send_school_registration_email(dummy_school, "kingdelexx@gmail.com")
print("Registration Email Result:", result_reg)

print("\nTesting School Approval Email...")
result_app = send_school_approval_email(dummy_school, "kingdelexx@gmail.com")
print("Approval Email Result:", result_app)
