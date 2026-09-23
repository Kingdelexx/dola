import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

import django
django.setup()

from api.models import School
from api.emails import send_school_registration_email, send_school_approval_email

dummy_school = School(
    name="Apex International School", 
    code="SCH-APX100",
    contact_person="Dr. Adebayo",
    contact_email="devnaijaacademy@gmail.com",
    principal_email="kingdelexx@gmail.com",
    phone_number="+2348012345678",
    number_of_pupils=450
)

print("=== 1. TESTING SCHOOL REGISTRATION EMAIL (MULTI-RECIPIENT & ADMIN ALERT) ===")
result_reg = send_school_registration_email(dummy_school, ["devnaijaacademy@gmail.com", "kingdelexx@gmail.com"])
print("Registration Email Result:", result_reg)

print("\n=== 2. TESTING SCHOOL APPROVAL EMAIL ===")
result_app = send_school_approval_email(dummy_school, ["devnaijaacademy@gmail.com", "kingdelexx@gmail.com"])
print("Approval Email Result:", result_app)
