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
    pin = models.CharField(max_length=10, blank=True, null=True, help_text="4-digit access PIN for child login")
    points = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)

    # Stage progresses (representing high watermarks of levels completed)
    stage1_progress = models.IntegerField(default=0)
    stage2_progress = models.IntegerField(default=0)
    stage3_progress = models.IntegerField(default=0)
    stage4_progress = models.IntegerField(default=0)
    stage5_progress = models.IntegerField(default=0)

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
    starter_js = models.TextField(blank=True, default='')
    solution_criteria = models.JSONField(default=dict)
    reward_xp = models.IntegerField(default=50)

    def __str__(self):
        return f"{self.stage_order}. {self.title} ({self.slug})"


class StudentChallengeProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='web_challenge_progresses')
    challenge = models.ForeignKey(WebChallenge, on_delete=models.CASCADE, related_name='student_progresses')
    saved_html = models.TextField(blank=True, null=True)
    saved_css = models.TextField(blank=True, null=True)
    saved_js = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'challenge')

    def __str__(self):
        return f"{self.student.username} - {self.challenge.title} ({'Completed' if self.is_completed else 'In Progress'})"


class AppChallenge(models.Model):
    slug = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    class_number = models.PositiveIntegerField(default=1)
    stage_order = models.PositiveIntegerField(default=1)
    instructions_markdown = models.TextField()
    starter_screens = models.JSONField(default=list)
    starter_code = models.TextField(blank=True, default='')
    starter_blockly = models.TextField(blank=True, default='')
    solution_criteria = models.JSONField(default=dict)
    reward_xp = models.IntegerField(default=50)

    def __str__(self):
        return f"Class {self.class_number} - {self.title} ({self.slug})"


class StudentAppChallengeProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='app_challenge_progresses')
    challenge = models.ForeignKey(AppChallenge, on_delete=models.CASCADE, related_name='student_app_progresses')
    saved_screens = models.JSONField(default=list, blank=True)
    saved_code = models.TextField(blank=True, null=True)
    saved_blockly = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'challenge')

    def __str__(self):
        return f"{self.student.username} - {self.challenge.title} ({'Completed' if self.is_completed else 'In Progress'})"


class PizzaShopProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pizza_shop_progress')
    current_level = models.IntegerField(default=1)
    stars_earned = models.IntegerField(default=0)
    dola_coins = models.IntegerField(default=0)
    xp_earned = models.IntegerField(default=0)
    accuracy = models.FloatField(default=100.0)
    attempts = models.IntegerField(default=0)
    correct_orders = models.IntegerField(default=0)
    time_spent_seconds = models.IntegerField(default=0)
    counting_accuracy = models.FloatField(default=100.0)
    addition_accuracy = models.FloatField(default=100.0)
    subtraction_accuracy = models.FloatField(default=100.0)
    problem_solving_accuracy = models.FloatField(default=100.0)
    hints_used = models.IntegerField(default=0)
    coding_concepts_completed = models.IntegerField(default=0)
    badges = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Pizza Shop Lvl {self.current_level} ({self.dola_coins} Coins)"


class RobotMazeProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='robot_maze_progress')
    current_level = models.IntegerField(default=1)
    stars_earned = models.IntegerField(default=0)
    dola_coins = models.IntegerField(default=0)
    xp_earned = models.IntegerField(default=0)
    accuracy = models.FloatField(default=100.0)
    attempts = models.IntegerField(default=0)
    missions_completed = models.IntegerField(default=0)
    commands_used = models.IntegerField(default=0)
    hints_used = models.IntegerField(default=0)
    debugging_attempts = models.IntegerField(default=0)
    loops_completed = models.IntegerField(default=0)
    time_spent_seconds = models.IntegerField(default=0)
    badges = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Robot Maze Lvl {self.current_level} ({self.dola_coins} Coins)"


class MyLittleShopProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='my_little_shop_progress')
    current_level = models.IntegerField(default=1)
    stars_earned = models.IntegerField(default=0)
    dola_coins = models.IntegerField(default=0)
    xp_earned = models.IntegerField(default=0)
    accuracy = models.FloatField(default=100.0)
    attempts = models.IntegerField(default=0)
    customers_served = models.IntegerField(default=0)
    addition_accuracy = models.FloatField(default=100.0)
    subtraction_accuracy = models.FloatField(default=100.0)
    money_recognition_accuracy = models.FloatField(default=100.0)
    change_accuracy = models.FloatField(default=100.0)
    multiplication_accuracy = models.FloatField(default=100.0)
    profit_accuracy = models.FloatField(default=100.0)
    stock_accuracy = models.FloatField(default=100.0)
    problem_solving_accuracy = models.FloatField(default=100.0)
    hints_used = models.IntegerField(default=0)
    time_spent_seconds = models.IntegerField(default=0)
    shop_upgrades = models.JSONField(default=list)
    badges = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - My Little Shop Lvl {self.current_level} ({self.dola_coins} Coins)"


class FrogAdventureProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='frog_adventure_progress')
    current_level = models.IntegerField(default=1)
    stars_earned = models.IntegerField(default=0)
    dola_coins = models.IntegerField(default=0)
    xp_earned = models.IntegerField(default=0)
    accuracy = models.FloatField(default=100.0)
    attempts = models.IntegerField(default=0)
    fruits_collected = models.IntegerField(default=0)
    counting_accuracy = models.FloatField(default=100.0)
    sequence_accuracy = models.FloatField(default=100.0)
    pattern_accuracy = models.FloatField(default=100.0)
    coordinates_accuracy = models.FloatField(default=100.0)
    route_planning_accuracy = models.FloatField(default=100.0)
    loops_completed = models.IntegerField(default=0)
    debugging_attempts = models.IntegerField(default=0)
    hints_used = models.IntegerField(default=0)
    time_spent_seconds = models.IntegerField(default=0)
    unlocked_costumes = models.JSONField(default=list)
    badges = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Frog Adventure Lvl {self.current_level} ({self.dola_coins} Coins)"


class TrafficRescueProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='traffic_rescue_progress')
    current_level = models.IntegerField(default=1)
    stars_earned = models.IntegerField(default=0)
    dola_coins = models.IntegerField(default=0)
    xp_earned = models.IntegerField(default=0)
    city_points = models.IntegerField(default=0)
    accuracy = models.FloatField(default=100.0)
    attempts = models.IntegerField(default=0)
    vehicles_guided = models.IntegerField(default=0)
    pedestrians_saved = models.IntegerField(default=0)
    sequencing_ability = models.FloatField(default=100.0)
    logical_reasoning = models.FloatField(default=100.0)
    condition_usage = models.FloatField(default=100.0)
    timing_accuracy = models.FloatField(default=100.0)
    debugging_accuracy = models.FloatField(default=100.0)
    hints_used = models.IntegerField(default=0)
    time_spent_seconds = models.IntegerField(default=0)
    city_upgrades = models.JSONField(default=list)
    badges = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Traffic Rescue Lvl {self.current_level} ({self.city_points} City Points)"


class PetRescueProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pet_rescue_progress')
    current_level = models.IntegerField(default=1)
    stars_earned = models.IntegerField(default=0)
    dola_coins = models.IntegerField(default=0)
    xp_earned = models.IntegerField(default=0)
    happiness_points = models.IntegerField(default=0)
    accuracy = models.FloatField(default=100.0)
    attempts = models.IntegerField(default=0)
    pets_helped = models.IntegerField(default=0)
    counting_accuracy = models.FloatField(default=100.0)
    classification_accuracy = models.FloatField(default=100.0)
    sequence_accuracy = models.FloatField(default=100.0)
    pattern_accuracy = models.FloatField(default=100.0)
    condition_usage = models.FloatField(default=100.0)
    loops_completed = models.IntegerField(default=0)
    debugging_accuracy = models.FloatField(default=100.0)
    hints_used = models.IntegerField(default=0)
    time_spent_seconds = models.IntegerField(default=0)
    unlocked_pets = models.JSONField(default=list)
    unlocked_accessories = models.JSONField(default=list)
    badges = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Pet Rescue Lvl {self.current_level} ({self.happiness_points} Happiness Pts)"


class SubscriptionPlan(models.Model):
    INTERVAL_CHOICES = (
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly/Termly (3 Months)'),
        ('biannual', 'Biannual (6 Months)'),
        ('annually', 'Annually (1 Year)'),
    )

    plan_name = models.CharField(max_length=100)
    plan_description = models.TextField(blank=True, default='')
    amount = models.DecimalField(max_digits=12, decimal_places=2)  # In NGN
    currency = models.CharField(max_length=10, default='NGN')
    billing_interval = models.CharField(max_length=20, choices=INTERVAL_CHOICES, default='monthly')
    paystack_plan_code = models.CharField(max_length=100, blank=True, null=True, unique=True)
    features = models.JSONField(default=list, blank=True)
    promotional_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    promotional_headline = models.CharField(max_length=150, blank=True, default='')
    is_promotional = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['amount']

    def __str__(self):
        return f"{self.plan_name} - {self.currency} {self.amount} ({self.get_billing_interval_display()})"

    @property
    def amount_in_kobo(self):
        return int(self.amount * 100)

    def is_feature_included(self, feature: str) -> bool:
        if not self.features:
            return True
        if 'all' in self.features or '*' in self.features:
            return True
        norm = feature.lower().strip()
        return any(f.lower().strip() == norm for f in self.features)


class Subscription(models.Model):
    STATUS_CHOICES = (
        ('inactive', 'Inactive'),
        ('active', 'Active'),
        ('past_due', 'Past Due'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    )

    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='subscriptions', null=True, blank=True)
    subscription_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive', db_index=True)
    
    paystack_customer_code = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    paystack_subscription_code = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    paystack_email_token = models.CharField(max_length=100, blank=True, null=True)

    subscription_start_date = models.DateTimeField(null=True, blank=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True, db_index=True)
    next_payment_date = models.DateTimeField(null=True, blank=True)
    cancellation_date = models.DateTimeField(null=True, blank=True)
    grace_period_end = models.DateTimeField(null=True, blank=True)

    subscribed_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_manual_compensation = models.BooleanField(default=False)
    manual_compensation_reason = models.TextField(blank=True, default='')
    manual_compensated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='compensated_subscriptions')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Subscription #{self.id} - Parent: {self.parent.username} ({self.subscription_status})"

    def is_valid(self):
        from django.utils import timezone
        now = timezone.now()
        if self.subscription_status == 'active':
            if self.current_period_end:
                return self.current_period_end >= now
            return True
        if self.subscription_status == 'past_due' and self.grace_period_end:
            return self.grace_period_end >= now
        if self.subscription_status == 'cancelled' and self.current_period_end:
            return self.current_period_end >= now
        return False


class Payment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('abandoned', 'Abandoned'),
    )

    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    payment_reference = models.CharField(max_length=120, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)  # In NGN
    currency = models.CharField(max_length=10, default='NGN')
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    payment_channel = models.CharField(max_length=50, blank=True, null=True)
    paystack_transaction_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    payment_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.payment_reference} - {self.currency} {self.amount} ({self.payment_status})"


class WebhookEvent(models.Model):
    PROCESSING_CHOICES = (
        ('pending', 'Pending'),
        ('processed', 'Processed'),
        ('failed', 'Failed'),
        ('ignored', 'Ignored'),
    )

    event_id = models.CharField(max_length=150, unique=True, db_index=True)
    event_type = models.CharField(max_length=100, db_index=True)
    payment_reference = models.CharField(max_length=120, blank=True, null=True, db_index=True)
    processing_status = models.CharField(max_length=20, choices=PROCESSING_CHOICES, default='pending', db_index=True)
    received_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-received_at']

    def __str__(self):
        return f"WebhookEvent {self.event_id} ({self.event_type}) - {self.processing_status}"


class BlocklyProject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blockly_projects')
    title = models.CharField(max_length=200, default='My Block Project')
    description = models.TextField(blank=True, default='')
    workspace_xml = models.TextField(blank=True, default='')
    python_code = models.TextField(blank=True, default='')
    level_index = models.IntegerField(default=0)
    sprites_data = models.JSONField(default=dict, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class PythonProject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='python_projects')
    title = models.CharField(max_length=200, default='My Python Quest')
    description = models.TextField(blank=True, default='')
    code = models.TextField(default='')
    chapter_id = models.IntegerField(default=0)
    level_id = models.CharField(max_length=50, blank=True, default='')
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class AppStudioProject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='app_studio_projects')
    project_id = models.CharField(max_length=100, blank=True, default='', db_index=True)
    name = models.CharField(max_length=200, default='My Mobile App')
    screens = models.JSONField(default=list)
    assets = models.JSONField(default=list, blank=True)
    code = models.TextField(blank=True, default='')
    blockly_xml = models.TextField(blank=True, default='')
    is_favorite = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class AdminAuditLog(models.Model):
    admin_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_audit_logs')
    action = models.CharField(max_length=100, db_index=True)
    target_model = models.CharField(max_length=100, blank=True, default='')
    target_id = models.CharField(max_length=100, blank=True, default='')
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M')}] {self.admin_user.username} - {self.action}"


class SubscriptionSetting(models.Model):
    key = models.CharField(max_length=50, unique=True, db_index=True)
    value = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}: {self.value}"

    @classmethod
    def get_grace_period_days(cls) -> int:
        from django.conf import settings
        default_days = getattr(settings, 'SUBSCRIPTION_GRACE_PERIOD_DAYS', 3)
        try:
            item = cls.objects.filter(key='grace_period_days').first()
            if item and item.value.isdigit():
                return int(item.value)
        except Exception:
            pass
        return default_days


class DolaMoneyProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dolamoney_progress')
    dola_coins = models.IntegerField(default=0)  # Educational in-platform rewards only (not real money, non-redeemable)
    xp_earned = models.IntegerField(default=0)
    savings_streak = models.IntegerField(default=0)
    savings_total = models.IntegerField(default=0)
    current_world = models.IntegerField(default=1)
    completed_worlds = models.JSONField(default=list)
    world_levels = models.JSONField(default=dict)
    active_savings_goal = models.JSONField(default=dict)
    business_stats = models.JSONField(default=dict)
    bank_stats = models.JSONField(default=dict)
    financial_skills = models.JSONField(default=dict)
    badges = models.JSONField(default=list)
    time_spent_seconds = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - DolaMoney Quest ({self.dola_coins} Coins, World {self.current_world})"







