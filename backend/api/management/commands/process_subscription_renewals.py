from django.core.management.base import BaseCommand
from api.subscription_service import process_expired_subscriptions

class Command(BaseCommand):
    help = "Sweeps and processes expired subscriptions, respecting grace periods and preserving child data."

    def handle(self, *args, **options):
        self.stdout.write("Running subscription expiration sweep...")
        result = process_expired_subscriptions()
        self.stdout.write(self.style.SUCCESS(
            f"Sweep completed successfully at {result['timestamp']}.\n"
            f"- Expired subscriptions transitioned: {result['expired_count']}\n"
            f"- Subscriptions marked past-due in grace: {result['past_due_count']}\n"
            f"- Note: {result['preservation_status']}"
        ))
