from django.db import migrations


def update_plans(apps, schema_editor):
    SubscriptionPlan = apps.get_model('api', 'SubscriptionPlan')

    # 1. Monthly Plan -> 10,000 NGN
    monthly = SubscriptionPlan.objects.filter(billing_interval='monthly').first()
    if monthly:
        monthly.plan_name = "Monthly Explorer"
        monthly.amount = 10000.00
        monthly.currency = "NGN"
        monthly.paystack_plan_code = "PLN_dmt3enn7u1045sx"
        monthly.is_active = True
        monthly.features = ["numeracy", "block_coding", "python_quest", "app_studio", "web_studio", "premium_content"]
        monthly.plan_description = "Full access to all 4 coding worlds, 6 interactive numeracy games, and Lizzy AI tutor for all linked children."
        monthly.save()
    else:
        SubscriptionPlan.objects.create(
            plan_name="Monthly Explorer",
            amount=10000.00,
            currency="NGN",
            billing_interval="monthly",
            paystack_plan_code="PLN_dmt3enn7u1045sx",
            features=["numeracy", "block_coding", "python_quest", "app_studio", "web_studio", "premium_content"],
            is_active=True,
            plan_description="Full access to all 4 coding worlds, 6 interactive numeracy games, and Lizzy AI tutor for all linked children."
        )

    # 2. Annual Plan -> 100,000 NGN
    annual = SubscriptionPlan.objects.filter(billing_interval='annually').first()
    if annual:
        annual.plan_name = "Annual Champion (1 Year)"
        annual.amount = 100000.00
        annual.currency = "NGN"
        annual.paystack_plan_code = "PLN_27x0pbe5znqyzte"
        annual.is_active = True
        annual.features = ["numeracy", "block_coding", "python_quest", "app_studio", "web_studio", "premium_content"]
        annual.plan_description = "Best value for full-year coding mastery! Covers all coding stages, game studios, and weekly AI progress reports. Save ₦20,000 (2 months free)."
        annual.save()
    else:
        SubscriptionPlan.objects.create(
            plan_name="Annual Champion (1 Year)",
            amount=100000.00,
            currency="NGN",
            billing_interval="annually",
            paystack_plan_code="PLN_27x0pbe5znqyzte",
            features=["numeracy", "block_coding", "python_quest", "app_studio", "web_studio", "premium_content"],
            is_active=True,
            plan_description="Best value for full-year coding mastery! Covers all coding stages, game studios, and weekly AI progress reports. Save ₦20,000 (2 months free)."
        )

    # 3. Deactivate legacy quarterly/termly plans from active public selection
    SubscriptionPlan.objects.filter(billing_interval='quarterly').update(is_active=False)


def reverse_update(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_subscriptionsetting'),
    ]

    operations = [
        migrations.RunPython(update_plans, reverse_update),
    ]
