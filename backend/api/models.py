from django.db import models
from django.contrib.auth.models import User

class School(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    address = models.CharField(max_length=255, blank=True, null=True)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    principal_email = models.EmailField(blank=True, null=True)
    number_of_pupils = models.IntegerField(null=True, blank=True)
    phone_number = models.CharField(max_length=30, blank=True, null=True)
    expected_classes = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code}) - {self.status}"


class Classroom(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='classrooms')
    name = models.CharField(max_length=100)
    grade_level = models.CharField(max_length=50, blank=True, null=True)
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_classes')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.school.name}"

class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin (Devnaija)'),
        ('school_admin', 'School Admin'),
        ('teacher', 'Teacher'),
        ('parent', 'Parent'),
        ('student', 'Student'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True, null=True)  # 'girl', 'boy', etc.
    coding_experience = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Multi-tenant links
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')

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
        return f"{self.user.username}'s Profile ({self.get_role_display()})"

class ParentChild(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parent_relations')
    child = models.ForeignKey(User, on_delete=models.CASCADE, related_name='child_relations')
    linked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('parent', 'child')

    def __str__(self):
        return f"Parent: {self.parent.username} -> Child: {self.child.username}"


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

