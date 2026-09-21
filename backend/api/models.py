from django.db import models
from django.contrib.auth.models import User
import random
import string

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
    join_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.join_code:
            loop_count = 0
            while True:
                code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
                if not Classroom.objects.filter(join_code=code).exists():
                    self.join_code = code
                    break
                loop_count += 1
                if loop_count > 100:
                    self.join_code = f"CLS-{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.join_code}) - {self.school.name}"

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
    learning_band = models.CharField(max_length=20, blank=True, null=True) # 'Discoverer', 'Explorer', 'Builder', 'Innovator'
    starting_score = models.IntegerField(null=True, blank=True)
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

class StudentCompetency(models.Model):
    STATUS_CHOICES = (
        ('INTRODUCED', 'Introduced'),
        ('DEVELOPING', 'Developing'),
        ('PROFICIENT', 'Proficient'),
        ('MASTERED', 'Mastered'),
    )
    COMPETENCY_CHOICES = (
        ('sequencing', 'Sequencing & Logic'),
        ('patterns', 'Pattern Recognition'),
        ('loops', 'Loop Optimization'),
        ('debugging', 'Debugging & Reasoning'),
        ('conditions', 'Conditional Logic'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='competencies')
    competency = models.CharField(max_length=50, choices=COMPETENCY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='INTRODUCED')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'competency')

    def __str__(self):
        return f"{self.user.username} - {self.get_competency_display()}: {self.get_status_display()}"

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


class ProgressLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress_logs')
    stage = models.IntegerField()
    progress = models.IntegerField()
    points_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Stage {self.stage} Prog {self.progress} (+{self.points_earned} XP)"


class WebChallenge(models.Model):
    slug = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    stage_order = models.PositiveIntegerField(default=1)
    instructions_markdown = models.TextField()
    starter_html = models.TextField(blank=True, default='')
    starter_css = models.TextField(blank=True, default='')
    solution_criteria = models.JSONField(default=dict)
    reward_xp = models.IntegerField(default=50)

    def __str__(self):
        return f"{self.stage_order}. {self.title} ({self.slug})"


class StudentChallengeProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='web_challenge_progresses')
    challenge = models.ForeignKey(WebChallenge, on_delete=models.CASCADE, related_name='student_progresses')
    saved_html = models.TextField(blank=True, null=True)
    saved_css = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'challenge')

    def __str__(self):
        return f"{self.student.username} - {self.challenge.title} ({'Completed' if self.is_completed else 'In Progress'})"



