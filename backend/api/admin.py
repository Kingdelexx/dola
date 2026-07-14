from django.contrib import admin
from .models import UserProfile, Badge, UserBadge, Feedback

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'points', 'current_streak', 'longest_streak', 'stage1_progress', 'stage2_progress', 'stage3_progress', 'stage4_progress')
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

