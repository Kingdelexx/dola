import os
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

def _normalize_recipients(recipient_input):
    """
    Normalizes single string or list/tuple of email addresses into a unique,
    clean list of valid email strings. Handles nested lists/tuples recursively.
    """
    if not recipient_input:
        return []
    
    raw_list = []
    
    def _extract(item):
        if not item:
            return
        if isinstance(item, str):
            raw_list.extend([e.strip() for e in item.split(',') if e.strip()])
        elif isinstance(item, (list, tuple, set)):
            for sub_item in item:
                _extract(sub_item)

    _extract(recipient_input)
    
    clean_list = []
    for email in raw_list:
        if email and '@' in email and email not in clean_list:
            clean_list.append(email)
            
    return clean_list


def _parse_sender(from_email):
    """
    Parses 'Name <email@domain.com>' or 'email@domain.com' into dict {'name': ..., 'email': ...}
    """
    if not from_email:
        return {"name": "DolaCode", "email": "hello@devnaija.com"}
    if "<" in from_email and ">" in from_email:
        name_part, email_part = from_email.split("<", 1)
        name = name_part.strip().strip("\"'")
        email = email_part.split(">", 1)[0].strip()
        return {"name": name or "DolaCode", "email": email}
    return {"name": "DolaCode", "email": from_email.strip()}


def _send_via_brevo(subject, recipients, text_content, html_content, from_email, brevo_api_key):
    """
    Sends email via Brevo REST API v3 endpoint.
    """
    import urllib.request
    import json
    import ssl

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": brevo_api_key,
        "content-type": "application/json"
    }

    sender = _parse_sender(from_email)
    to_list = [{"email": email} for email in recipients]

    payload = {
        "sender": sender,
        "to": to_list,
        "subject": subject,
        "htmlContent": html_content,
        "textContent": text_content
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")

    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE

    try:
        with urllib.request.urlopen(req, context=context, timeout=15) as resp:
            body = resp.read().decode("utf-8")
            logger.info(f"Brevo API email sent to {recipients}: status={resp.status} response={body}")
            print(f"[Brevo Email Sent] From: {sender.get('email')} | To: {recipients} | Subject: '{subject}' | Status: {resp.status}")
            return True
    except Exception as e:
        if hasattr(e, "read"):
            err_body = e.read().decode("utf-8")
            logger.error(f"Brevo API HTTP Error {getattr(e, 'code', 'N/A')}: {err_body}")
            print(f"[Brevo API HTTP Error for {recipients}]: {getattr(e, 'code', 'N/A')} - {err_body}")
        else:
            logger.error(f"Brevo API delivery failed for {recipients}: {e}")
            print(f"[Brevo Delivery Error for {recipients}]: {e}")
        return False


def _dispatch_email(subject, recipient_email, text_content, html_content):
    """
    Dispatches email using Brevo API if BREVO_API_KEY is configured,
    falling back to Resend API if RESEND_API_KEY is configured,
    and finally falling back to Django's configured Email backend (SMTP / Console).
    """
    recipients = _normalize_recipients(recipient_email)
    if not recipients:
        logger.warning(f"No valid recipients provided for email: {subject}")
        print(f"[Email Warning]: No valid recipients provided for email subject: '{subject}'")
        return False

    brevo_api_key = os.environ.get("BREVO_API_KEY") or getattr(settings, "BREVO_API_KEY", "")
    resend_api_key = os.environ.get("RESEND_API_KEY") or getattr(settings, "RESEND_API_KEY", "")
    from_email = os.environ.get("DEFAULT_FROM_EMAIL") or getattr(settings, 'DEFAULT_FROM_EMAIL', 'DolaCode <hello@devnaija.com>')

    # 1. Primary: Brevo API
    if brevo_api_key:
        if _send_via_brevo(subject, recipients, text_content, html_content, from_email, brevo_api_key):
            return True
        logger.warning("Brevo delivery failed, attempting fallback...")

    # 2. Secondary Fallback: Resend API
    if resend_api_key:
        try:
            import resend
            resend.api_key = resend_api_key
            
            response = resend.Emails.send({
                "from": from_email,
                "to": recipients,
                "subject": subject,
                "html": html_content,
                "text": text_content
            })
            logger.info(f"Resend API email sent to {recipients}: {response}")
            print(f"[Resend Email Sent] From: {from_email} | To: {recipients} | Subject: '{subject}' | Response: {response}")
            return True
        except Exception as e:
            logger.error(f"Resend API delivery failed for {recipients}: {e}")
            print(f"[Resend Delivery Error for {recipients}]: {e}")

    # 3. Tertiary Fallback: Django core EmailMultiAlternatives
    try:
        from django.core.mail import EmailMultiAlternatives
        msg = EmailMultiAlternatives(subject, text_content, from_email, recipients)
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Django email sent to {recipients}")
        print(f"[Django Email Sent] From: {from_email} | To: {recipients} | Subject: '{subject}'")
        return True
    except Exception as e:
        logger.error(f"Django email delivery failed for {recipients}: {e}")
        print(f"[Django Email Delivery Error for {recipients}]: {e}")
        return False


def send_admin_new_school_alert(school):
    """
    Notifies Super Admins that a new school has registered and is pending approval.
    """
    admin_emails = ["devnaijaacademy@gmail.com"]
    subject = f"🔔 [ACTION REQUIRED] New School Registered: {school.name}"
    
    text_content = (
        f"A new school has registered on DolaCode and requires review:\n\n"
        f"School Name: {school.name}\n"
        f"School Code: {school.code}\n"
        f"Contact Person: {school.contact_person or 'N/A'}\n"
        f"Contact Email: {school.contact_email or 'N/A'}\n"
        f"Principal Email: {school.principal_email or 'N/A'}\n"
        f"Phone Number: {school.phone_number or 'N/A'}\n"
        f"Est. Pupils: {school.number_of_pupils or 'N/A'}\n\n"
        f"Log into Super Admin Dashboard to approve or reject this school:\n"
        f"https://dolacode.com.ng/super-admin"
    )

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; margin: 0; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 20px; border: 1px solid #f59e0b40; padding: 28px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
        .badge {{ background: #f59e0b20; color: #fbbf24; border: 1px solid #f59e0b40; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 800; display: inline-block; text-transform: uppercase; }}
        h1 {{ font-size: 22px; color: #ffffff; margin-top: 14px; margin-bottom: 8px; font-weight: 900; }}
        .box {{ background: #0f172a; border-radius: 12px; border: 1px solid #334155; padding: 16px; margin: 20px 0; font-size: 14px; color: #cbd5e1; line-height: 1.6; }}
        .btn {{ display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; margin-top: 12px; box-shadow: 0 4px 12px rgba(99,102,241,0.4); }}
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">🔔 New School Application</span>
        <h1>{school.name} has applied on DolaCode</h1>
        <div class="box">
          <p style="margin:4px 0;"><strong>School Code:</strong> <span style="color:#fbbf24; font-weight:bold;">{school.code}</span></p>
          <p style="margin:4px 0;"><strong>Contact Person:</strong> {school.contact_person or 'N/A'}</p>
          <p style="margin:4px 0;"><strong>Contact Email:</strong> {school.contact_email or 'N/A'}</p>
          <p style="margin:4px 0;"><strong>Principal Email:</strong> {school.principal_email or 'N/A'}</p>
          <p style="margin:4px 0;"><strong>Phone:</strong> {school.phone_number or 'N/A'}</p>
          <p style="margin:4px 0;"><strong>Est. Pupils:</strong> {school.number_of_pupils or 'N/A'}</p>
        </div>
        <div style="text-align: center;">
          <a href="https://dolacode.com.ng/super-admin" class="btn">Open Super Admin Dashboard →</a>
        </div>
      </div>
    </body>
    </html>
    """
    
    return _dispatch_email(subject, admin_emails, text_content, html_content)


def send_school_registration_email(school, recipient_email=None):
    """
    Sends a confirmation email when a school registers and is pending approval.
    Also notifies Devnaija super admins.
    """
    recipients = _normalize_recipients([
        recipient_email,
        getattr(school, 'contact_email', None),
        getattr(school, 'principal_email', None)
    ])

    if not recipients:
        return False

    subject = f"🏫 School Application Received - {school.name}"

    text_content = (
        f"Hello,\n\n"
        f"Thank you for registering {school.name} on DolaCode!\n\n"
        f"Your application has been received and is currently under review by our team.\n"
        f"School Name: {school.name}\n"
        f"School Code: {school.code}\n"
        f"Status: Pending Approval\n\n"
        f"Applications are typically reviewed within 24-48 hours. Once approved, you will receive a welcome email with full access to your Principal Dashboard.\n\n"
        f"Best regards,\n"
        f"The DolaCode Team\n"
        f"https://dolacode.com.ng"
    )

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 24px; border: 1px solid #334155; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }}
        .header {{ text-align: center; margin-bottom: 24px; }}
        .header h1 {{ font-size: 24px; color: #ffffff; margin: 8px 0 0 0; font-weight: 800; }}
        .badge {{ display: inline-block; padding: 6px 16px; background: #3b82f620; color: #60a5fa; border: 1px solid #3b82f640; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }}
        .info-box {{ background: #0f172a; border-radius: 16px; border: 1px solid #334155; padding: 20px; margin: 24px 0; }}
        .code-highlight {{ background: #f59e0b20; color: #fbbf24; border: 1px solid #f59e0b40; padding: 4px 10px; border-radius: 8px; font-weight: 900; font-size: 16px; }}
        .footer {{ text-align: center; margin-top: 32px; font-size: 12px; color: #64748b; line-height: 1.5; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="badge">⏳ Application Received</span>
          <h1>Welcome to DolaCode!</h1>
        </div>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          Thank you for registering <strong>{school.name}</strong> on DolaCode. We are thrilled to partner with your institution in driving STEM and coding excellence for your students.
        </p>
        
        <div class="info-box">
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; color: #f8fafc;">
            <tr>
              <td style="color: #94a3b8; font-weight: 600;">School Name:</td>
              <td style="font-weight: 800; text-align: right;">{school.name}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-weight: 600;">Official School Code:</td>
              <td style="text-align: right;"><span class="code-highlight">{school.code}</span></td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-weight: 600;">Status:</td>
              <td style="color: #fbbf24; font-weight: 800; text-align: right;">⏳ Pending Approval</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
          Our review team is currently verifying your school details. Applications are typically processed within <strong>24 to 48 hours</strong>. Once approved, you will receive another email notifying you that your <strong>Principal Executive Dashboard</strong> is active.
        </p>

        <div class="footer">
          <p>© {school.created_at.year if hasattr(school, 'created_at') and school.created_at else 2026} DolaCode Platform. All rights reserved.<br>
          If you have questions, contact us at <a href="mailto:hello@devnaija.com" style="color: #60a5fa;">hello@devnaija.com</a>.</p>
        </div>
      </div>
    </body>
    </html>
    """

    # Dispatch super admin alert concurrently
    try:
        send_admin_new_school_alert(school)
    except Exception as e:
        logger.error(f"Failed to dispatch admin new school alert: {e}")

    return _dispatch_email(subject, recipients, text_content, html_content)


def send_school_approval_email(school, recipient_email=None):
    """
    Sends a welcome / approval email when a school status is updated to APPROVED.
    """
    recipients = _normalize_recipients([
        recipient_email,
        getattr(school, 'contact_email', None),
        getattr(school, 'principal_email', None)
    ])

    if not recipients:
        return False

    subject = f"🎉 Welcome to DolaCode! {school.name} is Approved!"

    login_url = "https://dolacode.com.ng/login"
    dashboard_url = "https://dolacode.com.ng/school-dashboard"
    teacher_invite_url = f"https://dolacode.com.ng/join/{school.code}"

    text_content = (
        f"Congratulations!\n\n"
        f"Your school application for {school.name} has been officially APPROVED by the Devnaija DolaCode Team!\n\n"
        f"School Code: {school.code}\n"
        f"Login: {login_url}\n"
        f"Teacher Invite Link: {teacher_invite_url}\n\n"
        f"Next Steps:\n"
        f"1. Log into your account: {login_url}\n"
        f"2. Create your classrooms (e.g. Primary 5 Alpha)\n"
        f"3. Share your Teacher Invite Link with faculty members\n"
        f"4. Add or import students via Excel upload\n\n"
        f"Welcome aboard!\n"
        f"The DolaCode Team"
    )

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 24px; border: 1px solid #10b98140; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }}
        .header {{ text-align: center; margin-bottom: 24px; }}
        .header h1 {{ font-size: 26px; color: #ffffff; margin: 8px 0 0 0; font-weight: 900; }}
        .badge {{ display: inline-block; padding: 6px 16px; background: #10b98120; color: #34d399; border: 1px solid #10b98140; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }}
        .info-box {{ background: #0f172a; border-radius: 16px; border: 1px solid #334155; padding: 20px; margin: 24px 0; }}
        .btn {{ display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; font-weight: 800; text-decoration: none; border-radius: 14px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); margin: 10px 5px; }}
        .code-highlight {{ background: #10b98120; color: #34d399; border: 1px solid #10b98140; padding: 4px 10px; border-radius: 8px; font-weight: 900; font-size: 18px; font-family: monospace; }}
        .step-card {{ background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 12px 16px; margin-bottom: 10px; font-size: 14px; color: #cbd5e1; }}
        .footer {{ text-align: center; margin-top: 32px; font-size: 12px; color: #64748b; line-height: 1.5; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="badge">✅ Approved Partner School</span>
          <h1>Welcome to DolaCode! 🎉</h1>
        </div>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; text-align: center;">
          Great news! Your school application for <strong style="color: #ffffff;">{school.name}</strong> has been officially approved. Your Principal Executive Dashboard is now active.
        </p>
        
        <div class="info-box">
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; color: #f8fafc;">
            <tr>
              <td style="color: #94a3b8; font-weight: 600;">School Name:</td>
              <td style="font-weight: 800; text-align: right;">{school.name}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-weight: 600;">School Code:</td>
              <td style="text-align: right;"><span class="code-highlight">{school.code}</span></td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-weight: 600;">Teacher Invite Link:</td>
              <td style="font-weight: 700; text-align: right; color: #818cf8; font-size: 12px;">{teacher_invite_url}</td>
            </tr>
          </table>
        </div>

        <h3 style="color: #ffffff; font-size: 16px; font-weight: 800; margin-top: 24px;">🚀 Quick Onboarding Steps:</h3>
        
        <div class="step-card">
          1. 📚 <strong>Create Classrooms:</strong> Add your classes (e.g. Primary 5, Grade 4) in your dashboard.
        </div>
        <div class="step-card">
          2. 👩‍🏫 <strong>Invite Teachers:</strong> Share your Teacher Invite Link with teachers to join your school.
        </div>
        <div class="step-card">
          3. 🎓 <strong>Add Students:</strong> Upload your student list using our easy Excel template or share Class Join Codes!
        </div>

        <div style="text-align: center; margin-top: 28px;">
          <a href="{login_url}" class="btn">Login →</a>
        </div>

        <div class="footer">
          <p>© {school.created_at.year if hasattr(school, 'created_at') and school.created_at else 2026} DolaCode Platform. All rights reserved.<br>
          Need assistance? Contact our team at <a href="mailto:hello@devnaija.com" style="color: #60a5fa;">hello@devnaija.com</a>.</p>
        </div>
      </div>
    </body>
    </html>
    """

    return _dispatch_email(subject, recipients, text_content, html_content)


def send_subscription_payment_failed_email(parent, subscription, grace_days=3):
    """
    Sends an alert email to a parent when an automated Paystack recurring renewal charge fails.
    Uses exact required copy:
    "Your DolaCode subscription could not be renewed.
    Your child's learning progress and saved projects are safe.
    Please update your payment details to continue learning."
    """
    if not parent or not parent.email:
        return False

    recipients = [parent.email]
    subject = "Your DolaCode Subscription Renewal Notice"
    plan_name = subscription.plan.plan_name if (subscription and subscription.plan) else "Family Membership"
    parent_name = parent.first_name or parent.username
    update_payment_url = "https://dolacode.com.ng/parent/subscription"

    text_content = f"""
Hello {parent_name},

Your DolaCode subscription could not be renewed.

Your child's learning progress and saved projects are safe.

Please update your payment details to continue learning.

We have activated a {grace_days}-day grace period for your family account. Your children will continue to enjoy full access while you update your card.

Update Payment:
{update_payment_url}

Warm regards,
The DolaCode Team
hello@devnaija.com
"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; color: #e2e8f0; }}
        .badge {{ display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 6px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }}
        h1 {{ color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 16px; }}
        p {{ font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 16px; }}
        .highlight-box {{ background: linear-gradient(135deg, #1e1b4b, #312e81); border: 1px solid #6366f1; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: left; }}
        .highlight-title {{ color: #a5b4fc; font-weight: 800; font-size: 15px; margin-bottom: 8px; }}
        .btn {{ display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 12px; }}
        .footer {{ border-top: 1px solid #334155; margin-top: 32px; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="container">
        <span class="badge">Renewal Notice</span>
        <h1>Your DolaCode Subscription Renewal</h1>
        <p>Hello <strong>{parent_name}</strong>,</p>
        
        <div class="highlight-box">
          <div class="highlight-title">Important Account Notice:</div>
          <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 15px; font-weight: 700;">
            Your DolaCode subscription could not be renewed.
          </p>
          <p style="margin: 0 0 10px 0; color: #cbd5e1; font-size: 14px;">
            Your child's learning progress and saved projects are safe.
          </p>
          <p style="margin: 0; color: #a5b4fc; font-size: 14px; font-weight: 600;">
            Please update your payment details to continue learning.
          </p>
        </div>

        <p>A <strong>{grace_days}-day grace period</strong> has been activated on your account so your children have uninterrupted learning access while you update your card information.</p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="{update_payment_url}" class="btn">UPDATE PAYMENT →</a>
        </div>

        <div class="footer">
          <p>© 2026 DolaCode Platform. All rights reserved.<br>
          Questions? Reply directly to this email or reach us at <a href="mailto:hello@devnaija.com" style="color: #818cf8;">hello@devnaija.com</a>.</p>
        </div>
      </div>
    </body>
    </html>
    """

    return _dispatch_email(subject, recipients, text_content, html_content)


def send_payment_success_email(parent, subscription, payment=None, amount_paid=None, next_billing_date=None, tx_data=None):
    """
    Sends an automated, official payment confirmation and receipt email to a parent
    whenever a payment succeeds (via Bank Transfer, Card, USSD, or Paystack Webhook).
    """
    if not parent or not getattr(parent, 'email', None):
        return False

    recipients = _normalize_recipients([parent.email])
    if not recipients:
        return False

    parent_name = parent.first_name or parent.username or "Parent"
    plan = getattr(subscription, 'plan', None) if subscription else None
    plan_name = plan.plan_name if plan else "Family Membership"
    
    # Extract amount
    amt = 10000.0
    if amount_paid is not None:
        try:
            amt = float(amount_paid)
        except (ValueError, TypeError):
            amt = 10000.0
    elif payment and getattr(payment, 'amount', None):
        try:
            amt = float(payment.amount)
        except (ValueError, TypeError):
            pass
    elif subscription and getattr(subscription, 'subscribed_amount', None):
        try:
            amt = float(subscription.subscribed_amount)
        except (ValueError, TypeError):
            pass
    elif plan and getattr(plan, 'amount', None):
        try:
            amt = float(plan.amount)
        except (ValueError, TypeError):
            pass
    elif tx_data and tx_data.get('amount'):
        try:
            amt = float(tx_data['amount']) / 100.0
        except (ValueError, TypeError):
            pass

    # Extract reference
    reference = getattr(payment, 'payment_reference', None) or (tx_data.get('reference') if isinstance(tx_data, dict) else None) or "N/A"

    # Extract payment channel
    raw_channel = getattr(payment, 'payment_channel', None) or (tx_data.get('channel') if isinstance(tx_data, dict) else None) or "card"
    channel_map = {
        'card': 'Debit / Credit Card',
        'bank_transfer': 'Bank Transfer (Virtual Account)',
        'transfer': 'Bank Transfer (Virtual Account)',
        'bank': 'Pay with Bank (Direct Debit)',
        'ussd': 'USSD Dialing',
        'qr': 'QR Code / Zap',
        'mobile_money': 'Mobile Money'
    }
    channel_display = channel_map.get(str(raw_channel).lower(), str(raw_channel).replace('_', ' ').title())

    # Format period end / next renewal date
    now = timezone.now() if hasattr(timezone, 'now') else datetime.now()
    period_end = next_billing_date or getattr(subscription, 'current_period_end', None) or getattr(subscription, 'next_payment_date', None) or (now + timedelta(days=30))
    if hasattr(period_end, 'strftime'):
        formatted_date = period_end.strftime("%B %d, %Y")
    else:
        formatted_date = str(period_end)[:10]

    # Format payment date
    payment_date = getattr(payment, 'payment_date', None) or getattr(payment, 'created_at', None) or now
    if hasattr(payment_date, 'strftime'):
        formatted_payment_date = payment_date.strftime("%B %d, %Y, %I:%M %p")
    else:
        formatted_payment_date = str(payment_date)[:16]

    dashboard_url = "https://dolacode.com.ng/parent-dashboard"
    login_url = "https://dolacode.com.ng/login"

    subject = f"Receipt: Payment Confirmed for {plan_name} 🎉"

    text_content = f"""
Hello {parent_name},

Thank you! Your payment on DolaCode has been confirmed and your family subscription is active.

OFFICIAL PAYMENT RECEIPT
------------------------------------------------
Plan: {plan_name}
Amount Paid: ₦{amt:,.2f} NGN
Payment Reference: {reference}
Payment Method: {channel_display}
Payment Date: {formatted_payment_date}
Access Valid Until: {formatted_date}
Status: Confirmed & Active
------------------------------------------------

All coding worlds (Numeracy, Visual Blocks, Banana Tales Python, Web Dev, App Dev Studio), 6 numeracy games, DolaMoney financial literacy, and the 24/7 Lizzy AI tutor are now fully unlocked for all your linked children.

Manage your family account or view receipts:
{dashboard_url}

Your children can sign in directly on any computer or tablet:
{login_url}

Warm regards,
The DolaCode Team
https://dolacode.com.ng
hello@devnaija.com
"""

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px 16px; color: #f8fafc; }}
    .container {{ max-width: 620px; margin: 0 auto; background-color: #1e293b; border-radius: 24px; border: 1px solid #334155; padding: 36px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }}
    .badge {{ display: inline-block; background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2)); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 6px 16px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 18px; }}
    h1 {{ color: #ffffff; font-size: 24px; font-weight: 900; margin: 0 0 12px; line-height: 1.3; }}
    p {{ font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 16px; }}
    .receipt-card {{ background-color: #0f172a; border-radius: 18px; border: 2px solid #334155; padding: 24px; margin: 24px 0; }}
    .receipt-table {{ width: 100%; border-collapse: collapse; font-size: 14px; }}
    .receipt-table td {{ padding: 10px 0; border-bottom: 1px solid #1e293b; }}
    .receipt-table tr:last-child td {{ border-bottom: none; }}
    .receipt-label {{ color: #94a3b8; font-weight: 600; }}
    .receipt-value {{ text-align: right; color: #f8fafc; font-weight: 700; }}
    .amount-highlight {{ color: #34d399; font-size: 20px; font-weight: 900; }}
    .ref-code {{ font-family: monospace; color: #fbbf24; background: rgba(245, 158, 11, 0.1); padding: 2px 8px; border-radius: 6px; font-size: 12px; }}
    .feature-list {{ background: rgba(99, 102, 241, 0.08); border-radius: 16px; border: 1px solid rgba(99, 102, 241, 0.3); padding: 18px; margin: 20px 0; }}
    .feature-item {{ display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; color: #c7d2fe; }}
    .feature-item:last-child {{ margin-bottom: 0; }}
    .feature-icon {{ color: #10b981; margin-right: 8px; font-weight: bold; }}
    .btn {{ display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4); }}
    .btn-container {{ text-align: center; margin: 30px 0 16px; }}
    .footer {{ border-top: 1px solid #334155; margin-top: 32px; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; line-height: 1.6; }}
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">✅ Payment Confirmed • Official Receipt</span>
    <h1>Payment Successful, {parent_name}! 🎉</h1>
    <p>Thank you for subscribing to DolaCode. Your family membership is active and your payment has been processed successfully.</p>
    
    <div class="receipt-card">
      <table class="receipt-table">
        <tr>
          <td class="receipt-label">Membership Plan</td>
          <td class="receipt-value" style="color: #ffffff;">{plan_name}</td>
        </tr>
        <tr>
          <td class="receipt-label">Amount Paid</td>
          <td class="receipt-value"><span class="amount-highlight">₦{amt:,.2f}</span></td>
        </tr>
        <tr>
          <td class="receipt-label">Payment Reference</td>
          <td class="receipt-value"><span class="ref-code">{reference}</span></td>
        </tr>
        <tr>
          <td class="receipt-label">Payment Method</td>
          <td class="receipt-value">{channel_display}</td>
        </tr>
        <tr>
          <td class="receipt-label">Payment Date</td>
          <td class="receipt-value">{formatted_payment_date}</td>
        </tr>
        <tr>
          <td class="receipt-label">Access Valid Until</td>
          <td class="receipt-value" style="color: #60a5fa;">{formatted_date}</td>
        </tr>
        <tr>
          <td class="receipt-label">Status</td>
          <td class="receipt-value" style="color: #34d399;">Active &amp; Verified ✓</td>
        </tr>
      </table>
    </div>

    <div class="feature-list">
      <div style="font-weight: 800; color: #e0e7ff; font-size: 13px; margin-bottom: 8px;">🚀 What's Unlocked for All Your Children:</div>
      <div class="feature-item"><span class="feature-icon">✓</span> All 4 Coding Stages &amp; Studios (Numeracy, Blocks, Python, Web/App Dev)</div>
      <div class="feature-item"><span class="feature-icon">✓</span> 6 Interactive Numeracy Puzzles &amp; DolaMoney Financial Literacy Game</div>
      <div class="feature-item"><span class="feature-icon">✓</span> 24/7 Lizzy AI intelligent tutor assistance &amp; debugging help</div>
      <div class="feature-item"><span class="feature-icon">✓</span> Real-time progress monitoring &amp; weekly learning report emails</div>
    </div>

    <div class="btn-container">
      <a href="{dashboard_url}" class="btn">Open Parent Dashboard →</a>
    </div>

    <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 16px;">
      Your children can sign in directly at <a href="{login_url}" style="color: #34d399; text-decoration: none; font-weight: 600;">{login_url}</a>.
    </p>

    <div class="footer">
      <p>© 2026 DolaCode Platform. All rights reserved.<br>
      Have questions about your receipt? Reply directly to this email or reach us at <a href="mailto:hello@devnaija.com" style="color: #60a5fa;">hello@devnaija.com</a>.</p>
    </div>
  </div>
</body>
</html>
"""

    return _dispatch_email(subject, recipients, text_content, html_content)


# Backwards compatibility alias for renewal callers
send_subscription_renewal_success_email = send_payment_success_email


def send_parent_welcome_email(parent):
    """
    Sends a warm welcome email to parents upon signup with actionable steps to:
    - Link their children
    - Set up 4-digit PINs for seamless child login
    - Access and navigate their Parent Dashboard
    """
    if not parent or not getattr(parent, 'email', None):
        return False

    recipients = _normalize_recipients([parent.email])
    if not recipients:
        return False

    parent_name = parent.first_name or parent.username or "Parent"
    subject = "Welcome to DolaCode – Your Family Learning Portal is Ready! 🚀"
    portal_url = "https://dolacode.com.ng/parent-dashboard"
    login_url = "https://dolacode.com.ng/login"

    text_content = f"""
Hello {parent_name},

Welcome to DolaCode! We are thrilled to partner with you in empowering your child's coding, STEM, and creative problem-solving journey.

Here is how to get your family set up in 3 simple steps:

1. LINK YOUR CHILDREN
Head to your Parent Dashboard and click "Add / Link Child". Enter your child's name and choose a 4-digit PIN they can easily remember.

2. EASY & SAFE CHILD LOGIN
When it's time to code, your child simply visits {login_url}, enters your parent email address, chooses their profile, and enters their 4-digit PIN. No complex passwords required!

3. TRACK PROGRESS ANYTIME
From your Parent Dashboard, you can monitor your children's completed coding stages, numeracy exercises, weekly progress reports, and earned certificates.

Log in to your account now:
{login_url}

If you have any questions or need guidance getting started, simply reply directly to this email or reach us at hello@devnaija.com.

Warm regards,
The DolaCode Team
https://dolacode.com.ng
"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #f8fafc; }}
        .container {{ max-width: 620px; margin: 0 auto; background-color: #1e293b; border-radius: 24px; border: 1px solid #334155; padding: 36px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }}
        .badge {{ display: inline-block; background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2)); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 6px 16px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 18px; }}
        h1 {{ color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 16px; line-height: 1.3; }}
        p {{ font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 16px; }}
        .step-box {{ background-color: #0f172a; border-radius: 18px; border: 1px solid #334155; padding: 20px; margin: 24px 0; }}
        .step-item {{ display: flex; align-items: flex-start; margin-bottom: 16px; }}
        .step-item:last-child {{ margin-bottom: 0; }}
        .step-number {{ background: linear-gradient(135deg, #10b981, #06b6d4); color: #ffffff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; margin-right: 14px; flex-shrink: 0; margin-top: 2px; }}
        .step-content h3 {{ color: #f8fafc; font-size: 15px; font-weight: 700; margin: 0 0 4px; }}
        .step-content p {{ color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.5; }}
        .btn {{ display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 15px 32px; border-radius: 14px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4); }}
        .btn-container {{ text-align: center; margin: 32px 0 20px; }}
        .footer {{ border-top: 1px solid #334155; margin-top: 32px; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; line-height: 1.6; }}
      </style>
    </head>
    <body>
      <div class="container">
        <span class="badge">🚀 Welcome to DolaCode</span>
        <h1>Welcome, {parent_name}!</h1>
        <p>Thank you for creating your parent account on DolaCode. We are delighted to partner with you in guiding your child&apos;s coding and future-ready technology journey.</p>
        
        <div class="step-box">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Link Your Children</h3>
              <p>Log in to your Parent Dashboard and click <strong>&quot;Add / Link Child&quot;</strong>. Enter your child&apos;s name and create a simple 4-digit PIN.</p>
            </div>
          </div>
          <div class="step-item" style="margin-top: 16px;">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Kid-Friendly Sign-In</h3>
              <p>Your child can log in from any computer or tablet: they enter your email, choose their name, and type their 4-digit PIN.</p>
            </div>
          </div>
          <div class="step-item" style="margin-top: 16px;">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Track Learning &amp; Mastery</h3>
              <p>Stay updated on completed stages, numeracy practice, weekly progress reports, and earned certificates all in one place.</p>
            </div>
          </div>
        </div>

        <div class="btn-container">
          <a href="{login_url}" class="btn">Login →</a>
        </div>

        <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 16px;">
          Need to sign your child in directly? Visit <a href="{login_url}" style="color: #34d399; text-decoration: none; font-weight: 600;">{login_url}</a>.
        </p>

        <div class="footer">
          <p>© 2026 DolaCode Platform. All rights reserved.<br>
          Questions? Reply directly to this email or contact us at <a href="mailto:hello@devnaija.com" style="color: #60a5fa;">hello@devnaija.com</a>.</p>
        </div>
      </div>
    </body>
    </html>
    """

    return _dispatch_email(subject, recipients, text_content, html_content)

