from django.contrib import admin
from .models import (
    UserProfile, Badge, UserBadge, Feedback,
    SubscriptionPlan, Subscription, Payment, WebhookEvent,
    AdminAuditLog, SubscriptionSetting
)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'points', 'current_streak', 'longest_streak', 'stage1_progress', 'stage2_progress', 'stage3_progress', 'stage4_progress')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email')

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'icon', 'condition_type', 'condition_value')
    search_fields = ('name',)

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'earned_at')
    list_filter = ('badge', 'earned_at')
    search_fields = ('user__username',)

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('user', 'stage', 'part', 'rating', 'difficulty', 'enjoyment', 'created_at')
    list_filter = ('stage', 'rating', 'difficulty', 'enjoyment', 'created_at')
    search_fields = ('user__username', 'comments')
    readonly_fields = ('created_at',)

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('plan_name', 'amount', 'currency', 'billing_interval', 'paystack_plan_code', 'is_active', 'created_at')
    list_filter = ('billing_interval', 'is_active', 'currency')
    search_fields = ('plan_name', 'paystack_plan_code')

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'parent', 'plan', 'subscription_status', 'current_period_start', 'current_period_end', 'grace_period_end', 'created_at')
    list_filter = ('subscription_status', 'plan', 'created_at')
    search_fields = ('parent__username', 'parent__email', 'paystack_customer_code', 'paystack_subscription_code')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_reference', 'parent', 'amount', 'currency', 'payment_status', 'payment_channel', 'payment_date', 'created_at')
    list_filter = ('payment_status', 'payment_channel', 'currency', 'created_at')
    search_fields = ('payment_reference', 'parent__username', 'parent__email', 'paystack_transaction_id')
    readonly_fields = ('created_at',)

@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ('event_id', 'event_type', 'payment_reference', 'processing_status', 'received_at', 'processed_at')
    list_filter = ('processing_status', 'event_type', 'received_at')
    search_fields = ('event_id', 'payment_reference')
    readonly_fields = ('received_at',)


@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'admin_user', 'action', 'target_model', 'target_id')
    list_filter = ('action', 'target_model', 'created_at')
    search_fields = ('admin_user__username', 'admin_user__email', 'action', 'target_id')
    readonly_fields = ('created_at',)


@admin.register(SubscriptionSetting)
class SubscriptionSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'updated_at')
    search_fields = ('key', 'description')





