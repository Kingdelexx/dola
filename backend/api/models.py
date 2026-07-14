from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.IntegerField(null=True, blank=True)
    coding_experience = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Gamification and streaks
    points = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)

    # Stage progresses (representing high watermarks of levels completed)
    stage1_progress = models.IntegerField(default=0)
    stage2_progress = models.IntegerField(default=0)
    stage3_progress = models.IntegerField(default=0)
    stage4_progress = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Badge(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50)  # E.g. emoji or Lucide icon key
    condition_type = models.CharField(max_length=50)  # 'stage1_progress', 'stage2_progress', 'streak', 'points'
    condition_value = models.IntegerField()

    def __str__(self):
        return self.name

class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='earned_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')

    def __str__(self):
        return f"{self.user.username} earned {self.badge.name}"

class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks')
    stage = models.IntegerField()
    part = models.IntegerField()
    rating = models.IntegerField()
    difficulty = models.CharField(max_length=20)
    enjoyment = models.CharField(max_length=20)
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Stage {self.stage} Part {self.part} Feedback"

