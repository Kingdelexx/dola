import os
import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)

def send_school_registration_email(school, recipient_email):
    """
    Sends a confirmation email when a school registers and is pending approval.
    """
    if not recipient_email:
        return False

    subject = f"🏫 School Application Received - {school.name}"
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'DolaCode <no-reply@dolacode.com>')
    to = [recipient_email]

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
        f"https://dolacode.com"
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
        .info-row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }}
        .info-label {{ color: #94a3b8; font-weight: 600; }}
        .info-val {{ color: #f8fafc; font-weight: 800; font-family: monospace; }}
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
          If you have questions, contact us at <a href="mailto:support@devnaija.com" style="color: #60a5fa;">support@devnaija.com</a>.</p>
        </div>
      </div>
    </body>
    </html>
    """

    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Sent registration email to {recipient_email} for school {school.name}")
        return True
    except Exception as e:
        logger.error(f"Failed to send school registration email: {e}")
        return False


def send_school_approval_email(school, recipient_email):
    """
    Sends a welcome / approval email when a school status is updated to APPROVED.
    """
    if not recipient_email:
        return False

    subject = f"🎉 Welcome to DolaCode! {school.name} is Approved!"
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'DolaCode <no-reply@dolacode.com>')
    to = [recipient_email]

    dashboard_url = "https://dolacode.com/school-dashboard"
    teacher_invite_url = f"https://dolacode.com/join/{school.code}"

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
          Need assistance? Contact our team at <a href="mailto:support@devnaija.com" style="color: #60a5fa;">support@devnaija.com</a>.</p>
        </div>
      </div>
    </body>
    </html>
    """

    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Sent approval email to {recipient_email} for school {school.name}")
        return True
    except Exception as e:
        logger.error(f"Failed to send school approval email: {e}")
        return False
