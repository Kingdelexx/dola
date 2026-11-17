import os
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import SubscriptionPlan
from api.paystack import get_secret_key, get_public_key, create_paystack_plan, get_headers, get_base_url
import httpx

class Command(BaseCommand):
    help = "Verifies Paystack integration and sets up live or test subscription plans."

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-plans',
            action='store_true',
            help='Automatically creates Monthly and Annual plans on your Paystack account via API.'
        )

    def handle(self, *args, **options):
        secret_key = get_secret_key()
        public_key = get_public_key()

        is_live = secret_key.startswith('sk_live_')
        mode_label = "LIVE PRODUCTION (REAL MONEY)" if is_live else "TEST SANDBOX"

        self.stdout.write(self.style.NOTICE(f"\n========================================================"))
        self.stdout.write(self.style.NOTICE(f" PAYSTACK GATEWAY STATUS: {mode_label}"))
        self.stdout.write(self.style.NOTICE(f"========================================================"))
        self.stdout.write(f"Secret Key: {secret_key[:12]}...{secret_key[-4:] if len(secret_key) > 16 else ''}")
        self.stdout.write(f"Public Key: {public_key[:12]}...{public_key[-4:] if len(public_key) > 16 else ''}")

        if not is_live:
            self.stdout.write(self.style.WARNING(
                "\n[NOTE] You are currently using TEST keys (sk_test_...).\n"
                "To accept real money from Nigerian bank cards, transfers, and USSD:\n"
                "1. Log into your Paystack Dashboard (https://dashboard.paystack.com)\n"
                "2. Switch toggle to 'Live'\n"
                "3. Copy your Live Secret Key (sk_live_...) & Live Public Key (pk_live_...)\n"
                "4. Update backend/.env and frontend/.env.local\n"
            ))

        # Test API connectivity
        self.stdout.write("\nTesting connectivity to Paystack API...")
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.get(f"{get_base_url()}/plan", headers=get_headers())
                if res.status_code == 200:
                    self.stdout.write(self.style.SUCCESS("✓ Successfully authenticated with Paystack API!"))
                else:
                    self.stdout.write(self.style.ERROR(f"✗ Paystack API returned status {res.status_code}: {res.text}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✗ Could not reach Paystack API: {e}"))

        monthly = SubscriptionPlan.objects.filter(billing_interval='monthly').first()
        annual = SubscriptionPlan.objects.filter(billing_interval='annually').first()

        self.stdout.write("\nCurrent Database Plans:")
        self.stdout.write(f"- Monthly: {monthly.plan_name if monthly else 'None'} | ₦{monthly.amount if monthly else 0} | Code: {monthly.paystack_plan_code if monthly else 'None'}")
        self.stdout.write(f"- Annual:  {annual.plan_name if annual else 'None'} | ₦{annual.amount if annual else 0} | Code: {annual.paystack_plan_code if annual else 'None'}")

        # Only create if explicitly requested or if current codes are missing or default test codes
        is_monthly_test_or_empty = not monthly or not monthly.paystack_plan_code or monthly.paystack_plan_code == 'PLN_dmt3enn7u1045sx'
        is_annual_test_or_empty = not annual or not annual.paystack_plan_code or annual.paystack_plan_code == 'PLN_27x0pbe5znqyzte'

        should_create = options.get('create_plans') or (is_live and (is_monthly_test_or_empty or is_annual_test_or_empty))

        if should_create:
            self.stdout.write("\nCreating/Synchronizing plans on Paystack account...")

            # 1. Monthly Plan (₦10,000 / month = 1,000,000 kobo)
            monthly_res = create_paystack_plan(
                name="Monthly Explorer",
                amount_kobo=1000000,
                interval="monthly",
                description="DolaCode Monthly Explorer Family Subscription"
            )
            if monthly_res.get('status') and monthly_res.get('plan_code'):
                code = monthly_res['plan_code']
                if monthly:
                    monthly.paystack_plan_code = code
                    monthly.save(update_fields=['paystack_plan_code'])
                self.stdout.write(self.style.SUCCESS(f"✓ Monthly Plan created on Paystack: {code}"))
            else:
                self.stdout.write(self.style.WARNING(f"! Monthly Plan creation: {monthly_res.get('message')}"))

            # 2. Annual Plan (₦100,000 / year = 10,000,000 kobo)
            annual_res = create_paystack_plan(
                name="Annual Champion (1 Year)",
                amount_kobo=10000000,
                interval="annually",
                description="DolaCode Annual Champion Family Subscription (2 Months Free)"
            )
            if annual_res.get('status') and annual_res.get('plan_code'):
                code = annual_res['plan_code']
                if annual:
                    annual.paystack_plan_code = code
                    annual.save(update_fields=['paystack_plan_code'])
                self.stdout.write(self.style.SUCCESS(f"✓ Annual Plan created on Paystack: {code}"))
            else:
                self.stdout.write(self.style.WARNING(f"! Annual Plan creation: {annual_res.get('message')}"))

        self.stdout.write(self.style.NOTICE(f"\n========================================================"))
        self.stdout.write(self.style.NOTICE(f" SETUP COMPLETED"))
        self.stdout.write(self.style.NOTICE(f"========================================================"))
