import httpx
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.auth.models import User
from api.models import ParentChild
from api.views import calculate_weekly_journey, calculate_skills

class Command(BaseCommand):
    help = 'Send weekly progress reports to parent accounts using Resend.com'

    def handle(self, *args, **options):
        api_key = getattr(settings, 'RESEND_API_KEY', '') or os.environ.get('RESEND_API_KEY', '')
        
        if not api_key or api_key == 'your-resend-api-key-here':
            self.stdout.write(self.style.ERROR("RESEND_API_KEY is not configured or still has the placeholder. Please set a valid Resend API key in backend/.env."))
            return

        parents = User.objects.filter(profile__role='parent')
        if not parents.exists():
            self.stdout.write(self.style.WARNING("No parent accounts found in the database."))
            return

        self.stdout.write(self.style.NOTICE(f"Processing progress updates for {parents.count()} parent accounts..."))

        success_count = 0
        error_count = 0

        for parent in parents:
            if not parent.email:
                self.stdout.write(self.style.WARNING(f"Parent '{parent.username}' has no email address. Skipping."))
                continue

            relations = ParentChild.objects.filter(parent=parent)
            if not relations.exists():
                self.stdout.write(self.style.WARNING(f"Parent '{parent.username}' has no linked child accounts. Skipping."))
                continue

            children_html = ""
            for rel in relations:
                child = rel.child
                c_profile = getattr(child, 'profile', None)
                if not c_profile:
                    continue

                # Compile weekly progress insights
                weekly_jd = calculate_weekly_journey(child, c_profile)
                skills = calculate_skills(c_profile)

                # Format skills bars
                skills_html = ""
                skills_to_show = [
                    ("Numeracy & Patterns", skills.get("numeracy_pattern_recognition", 0), "#ec4899"),
                    ("Logical Reasoning", skills.get("logical_reasoning", 0), "#f59e0b"),
                    ("Sequencing", skills.get("sequencing", 0), "#3b82f6"),
                    ("Debugging", skills.get("debugging", 0), "#ef4444"),
                    ("Coding Application", skills.get("coding_application", 0), "#10b981")
                ]

                for label, percentage, color in skills_to_show:
                    skills_html += f"""
                    <div style="margin-bottom: 8px;">
                        <span style="font-size: 11px; font-weight: bold; color: #475569; display: block; margin-bottom: 2px;">{label} ({percentage}%)</span>
                        <div style="background-color: #e2e8f0; border-radius: 9999px; height: 8px; width: 100%; overflow: hidden;">
                            <div style="background-color: {color}; height: 100%; border-radius: 9999px; width: {percentage}%;"></div>
                        </div>
                    </div>
                    """

                # Format each child card
                children_html += f"""
                <div style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 20px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                        <span style="font-size: 32px; margin-right: 12px;">🎓</span>
                        <div>
                            <h3 style="margin: 0; color: #0f172a; font-family: sans-serif; font-weight: 800; font-size: 18px;">{child.username}</h3>
                            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 12px; font-weight: 500;">Active Learner Stats</p>
                        </div>
                    </div>

                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px;">
                        <p style="margin: 4px 0; font-size: 13px; color: #334155; font-family: sans-serif;">📖 <strong>Lessons Done This Week:</strong> {weekly_jd.get('activities_completed', 0)}</p>
                        <p style="margin: 4px 0; font-size: 13px; color: #334155; font-family: sans-serif;">⭐ <strong>Weekly Improvement:</strong> {weekly_jd.get('biggest_improvement', 'N/A')}</p>
                        <p style="margin: 4px 0; font-size: 13px; color: #334155; font-family: sans-serif;">🔑 <strong>Mastery Area:</strong> {weekly_jd.get('new_skill', 'N/A')}</p>
                    </div>

                    <div style="margin-bottom: 16px;">
                        <h4 style="margin: 0 0 8px 0; color: #475569; font-size: 12px; text-transform: uppercase; tracking-letter: 0.05em; font-weight: 800;">Competency Spectrum</h4>
                        {skills_html}
                    </div>

                    <div style="border-top: 1px dashed #e2e8f0; padding-top: 12px; margin-top: 16px;">
                        <p style="margin: 0; font-size: 12px; color: #4f46e5; line-height: 1.5; font-family: sans-serif;">
                            💡 <strong>Try this at home:</strong> {weekly_jd.get('try_at_home', 'Encourage your child to continue their visual/code learning journey!')}
                        </p>
                    </div>
                </div>
                """

            # Complete Report HTML Wrapper
            email_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Weekly DolaCode Report</title>
            </head>
            <body style="font-family: sans-serif; background-color: #f1f5f9; padding: 24px; margin: 0; -webkit-font-smoothing: antialiased;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 28px; border: 4px solid #ffffff; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                    <!-- Header Banner -->
                    <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
                        <span style="font-size: 40px; display: block; margin-bottom: 8px;">👨‍👩‍👧‍👦</span>
                        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.025em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">DolaCode Weekly Report</h1>
                        <p style="margin: 8px 0 0 0; color: #f5f3ff; font-size: 13px; font-weight: 500; opacity: 0.9;">Empowering kids with computational competence</p>
                    </div>

                    <!-- Intro Card -->
                    <div style="padding: 24px;">
                        <p style="margin-top: 0; font-size: 15px; color: #334155; line-height: 1.6; font-family: sans-serif;">Hi <strong>{parent.username}</strong>,</p>
                        <p style="font-size: 14px; color: #475569; line-height: 1.6; font-family: sans-serif; margin-bottom: 24px;">
                            Here is the weekly progress analysis for your children from the DolaCode Learning Platform.
                        </p>

                        <!-- Children metrics -->
                        {children_html}

                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

                        <div style="text-align: center;">
                            <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b; font-family: sans-serif;">
                                To access real-time charts, AI recommendations, and links to your children's earned badges, visit the Parent Portal dashboard anytime.
                            </p>
                            <a href="http://localhost:3000/parent-dashboard" style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(236, 72, 153, 0.2);">
                                View Parent Dashboard
                            </a>
                        </div>
                    </div>

                    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; font-size: 11px; color: #94a3b8; font-family: sans-serif;">
                            Sent automatically by DolaCode Mission Control. Add updates@dolacode.com to your contact card to keep receiving progress updates.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """

            # POST request to Resend API
            try:
                # If Resend API is in sandbox test mode, it requires sending to verified emails, or onboarding@resend.dev
                # If they use verified domain DolaCode, it will send normally
                from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'DolaCode <no-reply@dolacode.com.ng>')

                response = httpx.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": from_email,
                        "to": parent.email,
                        "subject": f"Weekly Progress Report: Your child's coding journey!",
                        "html": email_body
                    },
                    timeout=15.0
                )

                if response.status_code in [200, 201, 202]:
                    self.stdout.write(self.style.SUCCESS(f"Successfully sent progress update to parent '{parent.username}' ({parent.email})"))
                    success_count += 1
                else:
                    self.stdout.write(self.style.ERROR(f"Failed to send to '{parent.username}' ({parent.email}). Resend status {response.status_code}: {response.text}"))
                    error_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"An exception occurred when sending to '{parent.username}': {str(e)}"))
                error_count += 1

        self.stdout.write(self.style.SUCCESS(f"Weekly reports job complete. Successfully sent: {success_count}, Failed: {error_count}"))
