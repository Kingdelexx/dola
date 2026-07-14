from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .serializers import UserSerializer, LoginSerializer
from .models import UserProfile

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.filter(is_superuser=False).count()
        # Add more stats if needed later
        return Response({
            "total_users": total_users,
        })

# Gamification Seeding & Views
from .models import Badge, UserBadge, Feedback
from .serializers import BadgeSerializer, FeedbackSerializer

DEFAULT_BADGES = [
    {
        "name": "First Steps",
        "description": "Complete your first level in World 1!",
        "icon": "🌱",
        "condition_type": "stage1_progress",
        "condition_value": 1
    },
    {
        "name": "Math Cadet",
        "description": "Complete Part 1 of Stage 1 (10 levels)",
        "icon": "📐",
        "condition_type": "stage1_progress",
        "condition_value": 10
    },
    {
        "name": "Math Whiz",
        "description": "Complete half of Stage 1 (40 levels)",
        "icon": "🧠",
        "condition_type": "stage1_progress",
        "condition_value": 40
    },
    {
        "name": "Math Master",
        "description": "Complete all of Stage 1 (80 levels)",
        "icon": "👑",
        "condition_type": "stage1_progress",
        "condition_value": 80
    },
    {
        "name": "Block Builder",
        "description": "Complete your first level in World 2!",
        "icon": "🧱",
        "condition_type": "stage2_progress",
        "condition_value": 1
    },
    {
        "name": "Block Master",
        "description": "Complete all levels in Stage 2",
        "icon": "🎮",
        "condition_type": "stage2_progress",
        "condition_value": 11
    },
    {
        "name": "Streak Starter",
        "description": "Keep a 3-day coding streak!",
        "icon": "🔥",
        "condition_type": "streak",
        "condition_value": 3
    },
    {
        "name": "Consistent Coder",
        "description": "Keep a 7-day coding streak!",
        "icon": "⚡",
        "condition_type": "streak",
        "condition_value": 7
    },
    {
        "name": "Star Collector",
        "description": "Earn 100 Stars",
        "icon": "⭐",
        "condition_type": "points",
        "condition_value": 100
    },
    {
        "name": "Super Scholar",
        "description": "Earn 500 Stars",
        "icon": "🏆",
        "condition_type": "points",
        "condition_value": 500
    }
]

def seed_default_badges():
    if Badge.objects.count() == 0:
        for badge_data in DEFAULT_BADGES:
            Badge.objects.create(**badge_data)

class UpdateProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        stage = request.data.get('stage')
        progress = request.data.get('progress')
        
        points_earned = 0
        
        # 1. Update progress if provided
        if stage is not None and progress is not None:
            stage = int(stage)
            progress = int(progress)
            
            if stage == 1:
                old_progress = profile.stage1_progress
                if progress > old_progress:
                    profile.stage1_progress = progress
                    points_earned = (progress - old_progress) * 10
            elif stage == 2:
                old_progress = profile.stage2_progress
                if progress > old_progress:
                    profile.stage2_progress = progress
                    points_earned = (progress - old_progress) * 10
            elif stage == 3:
                old_progress = profile.stage3_progress
                if progress > old_progress:
                    profile.stage3_progress = progress
                    points_earned = (progress - old_progress) * 10
            elif stage == 4:
                old_progress = profile.stage4_progress
                if progress > old_progress:
                    profile.stage4_progress = progress
                    points_earned = (progress - old_progress) * 10

        profile.points += points_earned

        # 2. Update Streak
        from datetime import timedelta
        from django.utils import timezone
        
        today = timezone.now().date()
        last_active = profile.last_active_date
        
        if last_active is None:
            profile.current_streak = 1
        elif last_active == today:
            # Already active today, streak remains same
            pass
        elif last_active == today - timedelta(days=1):
            profile.current_streak += 1
        else:
            profile.current_streak = 1
            
        if profile.current_streak > profile.longest_streak:
            profile.longest_streak = profile.current_streak
            
        profile.last_active_date = today
        profile.save()

        # 3. Check and award badges
        seed_default_badges()
        
        newly_unlocked_badges = []
        unearned_badges = Badge.objects.exclude(id__in=UserBadge.objects.filter(user=user).values_list('badge_id', flat=True))
        
        for badge in unearned_badges:
            unlocked = False
            if badge.condition_type == 'stage1_progress' and profile.stage1_progress >= badge.condition_value:
                unlocked = True
            elif badge.condition_type == 'stage2_progress' and profile.stage2_progress >= badge.condition_value:
                unlocked = True
            elif badge.condition_type == 'streak' and profile.current_streak >= badge.condition_value:
                unlocked = True
            elif badge.condition_type == 'points' and profile.points >= badge.condition_value:
                unlocked = True
                
            if unlocked:
                UserBadge.objects.create(user=user, badge=badge)
                newly_unlocked_badges.append(badge)

        return Response({
            "success": True,
            "points_earned": points_earned,
            "current_streak": profile.current_streak,
            "newly_unlocked_badges": BadgeSerializer(newly_unlocked_badges, many=True).data,
            "user": UserSerializer(user).data
        })

class BadgesListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        seed_default_badges()
        badges = Badge.objects.all()
        return Response({
            "badges": BadgeSerializer(badges, many=True).data
        })

class SubmitFeedbackView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({
                "success": True,
                "message": "Feedback submitted successfully!",
                "feedback": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
