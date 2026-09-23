import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def _normalize_recipients(recipient_input):
    """
    Normalizes single string or list/tuple of email addresses into a unique,
    clean list of valid email strings.
    """
    if not recipient_input:
        return []
    
    raw_list = []
    if isinstance(recipient_input, str):
        raw_list = [e.strip() for e in recipient_input.split(',') if e.strip()]
    elif isinstance(recipient_input, (list, tuple, set)):
        for item in recipient_input:
            if isinstance(item, str):
                raw_list.extend([e.strip() for e in item.split(',') if e.strip()])
    
    clean_list = []
    for email in raw_list:
        if email and '@' in email and email not in clean_list:
            clean_list.append(email)
            
    return clean_list


def _dispatch_email(subject, recipient_email, text_content, html_content):
    """
    Dispatches email using Resend API if RESEND_API_KEY is configured,
    otherwise falls back to Django's configured Email backend (SMTP / Console).
    """
    recipients = _normalize_recipients(recipient_email)
    if not recipients:
        logger.warning(f"No valid recipients provided for email: {subject}")
        print(f"[Email Warning]: No valid recipients provided for email subject: '{subject}'")
        return False

    resend_api_key = os.environ.get("RESEND_API_KEY") or getattr(settings, "RESEND_API_KEY", "")
    from_email = os.environ.get("DEFAULT_FROM_EMAIL") or getattr(settings, 'DEFAULT_FROM_EMAIL', 'DolaCode <no-reply@dolacode.com.ng>')

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
            print(f"[Resend Email Sent] From: {from_email} | To: {recipients} | Subject: {subject} | Response: {response}")
            return True
        except Exception as e:
            logger.error(f"Resend API delivery failed for {recipients}: {e}")
            print(f"[Resend Delivery Error for {recipients}]: {e}")

    # Fallback to Django core EmailMultiAlternatives
    try:
        from django.core.mail import EmailMultiAlternatives
        msg = EmailMultiAlternatives(subject, text_content, from_email, recipients)
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Django email sent to {recipients}")
        print(f"[Django Email Sent] From: {from_email} | To: {recipients} | Subject: {subject}")
        return True
    except Exception as e:
        logger.error(f"Django email delivery failed for {recipients}: {e}")
        print(f"[Django Email Delivery Error for {recipients}]: {e}")
        return False


def send_admin_new_school_alert(school):
    """
    Notifies Super Admins that a new school has registered and is pending approval.
    """
    admin_emails = ["devnaijaacademy@gmail.com", "support@dolacode.com.ng"]
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
          If you have questions, contact us at <a href="mailto:support@dolacode.com.ng" style="color: #60a5fa;">support@dolacode.com.ng</a>.</p>
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

    dashboard_url = "https://dolacode.com.ng/school-dashboard"
    teacher_invite_url = f"https://dolacode.com.ng/join/{school.code}"

    text_content = (
        f"Congratulations!\n\n"
        f"Your school application for {school.name} has been officially APPROVED by the Devnaija DolaCode Team!\n\n"
        f"School Code: {school.code}\n"
        f"Principal Dashboard: {dashboard_url}\n"
        f"Teacher Invite Link: {teacher_invite_url}\n\n"
        f"Next Steps:\n"
        f"1. Log into your Principal Dashboard: {dashboard_url}\n"
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
          <a href="{dashboard_url}" class="btn">Open Principal Dashboard →</a>
        </div>

        <div class="footer">
          <p>© {school.created_at.year if hasattr(school, 'created_at') and school.created_at else 2026} DolaCode Platform. All rights reserved.<br>
          Need assistance? Contact our team at <a href="mailto:support@dolacode.com.ng" style="color: #60a5fa;">support@dolacode.com.ng</a>.</p>
        </div>
      </div>
    </body>
    </html>
    """

    return _dispatch_email(subject, recipients, text_content, html_content)
