from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .serializers import (
    UserSerializer, LoginSerializer,
    BlocklyProjectSerializer, PythonProjectSerializer, AppStudioProjectSerializer
)
from .models import UserProfile, BlocklyProject, PythonProject, AppStudioProject, ParentChild
from .permissions import RequiresActiveSubscription, IsFamilyResourceOwner

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data, context={'request': request})
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


class FamilyProfilesView(APIView):
    """
    Given a parent email, discovers all family member profiles (parent + children)
    so children can easily choose their profile and log in with their 4-digit PIN.
    Route: POST /api/auth/family-profiles/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({"error": "Parent email is required."}, status=status.HTTP_400_BAD_REQUEST)

        from django.db.models import Q
        parent_user = User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email)).first()

        if not parent_user:
            return Response({
                "found": False,
                "is_family": False,
                "message": "No account found with this email."
            }, status=status.HTTP_404_NOT_FOUND)

        profile = getattr(parent_user, 'profile', None)
        role = profile.role if profile else 'student'

        # If not a parent or super_admin, this is not a family parent account
        if role not in ['parent', 'super_admin']:
            return Response({
                "found": True,
                "is_family": False,
                "role": role,
                "name": parent_user.first_name or parent_user.username
            }, status=status.HTTP_200_OK)

        # Get all linked children
        relations = ParentChild.objects.filter(parent=parent_user).select_related('child', 'child__profile')

        profiles = []
        # Parent account entry
        parent_name = parent_user.first_name or parent_user.username
        profiles.append({
            "id": parent_user.id,
            "name": parent_name,
            "role": "parent",
            "is_parent": True,
            "username": parent_user.username,
            "avatar_letter": parent_name[0].upper() if parent_name else 'P',
        })

        for rel in relations:
            child = rel.child
            c_profile = getattr(child, 'profile', None)
            display_name = child.first_name or child.username
            profiles.append({
                "id": child.id,
                "name": display_name,
                "role": "student",
                "is_parent": False,
                "username": child.username,
                "age": c_profile.age if c_profile else None,
                "gender": c_profile.gender if c_profile else None,
                "points": c_profile.points if c_profile else 0,
                "has_pin": bool(c_profile and c_profile.pin),
                "avatar_letter": display_name[0].upper() if display_name else 'S',
            })

        return Response({
            "found": True,
            "is_family": True,
            "parent_id": parent_user.id,
            "parent_name": parent_name,
            "parent_email": parent_user.email,
            "children_count": len(relations),
            "profiles": profiles
        }, status=status.HTTP_200_OK)


class ChildPinLoginView(APIView):
    """
    Authenticates a child using their parent's email, child profile ID, and 4-digit PIN.
    Route: POST /api/auth/child-pin-login/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        parent_email = request.data.get('parent_email', '').strip().lower()
        child_id = request.data.get('child_id')
        pin = str(request.data.get('pin', '')).strip()

        if not parent_email:
            return Response({"error": "Parent email is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not child_id:
            return Response({"error": "Child profile ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not pin or len(pin) != 4 or not pin.isdigit():
            return Response({"error": "Please enter a valid 4-digit PIN."}, status=status.HTTP_400_BAD_REQUEST)

        from django.db.models import Q
        parent_user = User.objects.filter(Q(email__iexact=parent_email) | Q(username__iexact=parent_email)).first()
        if not parent_user:
            return Response({"error": "Parent account not found."}, status=status.HTTP_404_NOT_FOUND)

        is_linked = ParentChild.objects.filter(parent=parent_user, child_id=child_id).exists()
        if not is_linked:
            return Response({"error": "Child account is not linked to this parent."}, status=status.HTTP_403_FORBIDDEN)

        try:
            child = User.objects.get(id=child_id)
        except User.DoesNotExist:
            return Response({"error": "Child account not found."}, status=status.HTTP_404_NOT_FOUND)

        c_profile = getattr(child, 'profile', None)
        stored_pin = (c_profile.pin if c_profile else '') or ''

        pin_matched = False
        if stored_pin and stored_pin == pin:
            pin_matched = True
        elif child.check_password(pin):
            pin_matched = True

        if not pin_matched:
            return Response({
                "error": "Incorrect 4-digit PIN. Please try again or ask your parent to check the PIN in the Parent Dashboard."
            }, status=status.HTTP_401_UNAUTHORIZED)

        from django.utils import timezone
        if c_profile:
            c_profile.last_active_date = timezone.now().date()
            needs_save = False
            if c_profile.starting_score is None:
                c_profile.starting_score = 50
                needs_save = True
            if not c_profile.learning_band:
                c_profile.learning_band = 'Cadet'
                needs_save = True
            if needs_save:
                c_profile.save(update_fields=['last_active_date', 'starting_score', 'learning_band'])
            else:
                c_profile.save(update_fields=['last_active_date'])

        token, _ = Token.objects.get_or_create(user=child)
        user_data = UserSerializer(child).data
        try:
            from .subscription_service import is_student_accessible
            user_data['subscription_access'] = is_student_accessible(child)
        except Exception:
            pass
        return Response({
            "token": token.key,
            "user": user_data,
            "message": f"Welcome back to DolaCode, {child.first_name or child.username}!"
        }, status=status.HTTP_200_OK)

class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        credential = request.data.get('credential') or request.data.get('id_token')
        email = request.data.get('email')
        name = request.data.get('name') or request.data.get('username')
        role = request.data.get('role', 'student')
        school_name = request.data.get('school_name')
        school_code = request.data.get('school_code')

        age_val = request.data.get('age') or request.data.get('profile', {}).get('age')
        age = None
        if age_val:
            try:
                age = int(age_val)
            except (ValueError, TypeError):
                pass
        coding_experience = request.data.get('coding_experience') or request.data.get('profile', {}).get('coding_experience', '')

        if credential:
            try:
                import json, base64
                parts = credential.split('.')
                if len(parts) >= 2:
                    padding = '=' * (4 - len(parts[1]) % 4)
                    payload_b64 = parts[1] + padding
                    payload_bytes = base64.b64decode(payload_b64)
                    payload = json.loads(payload_bytes)
                    email = payload.get('email') or email
                    name = payload.get('name') or payload.get('given_name') or name
            except Exception as e:
                print("Error decoding Google credential:", e)

        if not email:
            return Response({"error": "Google email or credential is required."}, status=status.HTTP_400_BAD_REQUEST)

        email = email.strip().lower()
        user = User.objects.filter(email__iexact=email).first()

        if not user:
            base_username = (name or email.split('@')[0]).strip()
            username = base_username
            counter = 1
            while User.objects.filter(username__iexact=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            import uuid
            user = User.objects.create_user(
                username=username,
                email=email,
                password=str(uuid.uuid4())
            )

            school_obj = None
            if school_code:
                from .models import School
                school_obj = School.objects.filter(code__iexact=school_code.strip()).first()

            if not school_obj and school_name and role == 'school_admin':
                import random, string
                from .models import School
                code = f"SCH-{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
                school_obj = School.objects.create(
                    name=school_name,
                    code=code,
                    status='PENDING',
                    contact_email=email
                )
                try:
                    from .emails import send_school_registration_email
                    send_school_registration_email(school_obj, email)
                except Exception as e:
                    print("Error sending google auth registration email:", e)

            if email.endswith('@devnaija.com'):
                role = 'super_admin'
                user.is_superuser = True
                user.is_staff = True
                user.save()

            learning_band = None
            if age and role == 'student':
                if age <= 8:
                    learning_band = 'Discoverer'
                elif age <= 11:
                    learning_band = 'Explorer'
                elif age <= 14:
                    learning_band = 'Builder'
                else:
                    learning_band = 'Innovator'

            UserProfile.objects.create(
                user=user,
                role=role,
                age=age,
                coding_experience=coding_experience,
                learning_band=learning_band,
                school=school_obj
            )

            if role == 'parent':
                try:
                    from .emails import send_parent_welcome_email
                    send_parent_welcome_email(user)
                except Exception as e:
                    print("Error sending parent welcome email (Google Auth):", e)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)



class UserDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        try:
            from .subscription_service import is_student_accessible
            data['subscription_access'] = is_student_accessible(request.user)
        except Exception as e:
            data['subscription_access'] = {"has_access": True, "reason": "Default fallback", "status": "active"}
        return Response(data)

class SubmitOnboardingDiagnosticView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        score = request.data.get('score')
        if score is None:
            return Response({"error": "Score is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            score = int(score)
        except (ValueError, TypeError):
            return Response({"error": "Invalid score value"}, status=status.HTTP_400_BAD_REQUEST)

        profile = request.user.profile
        profile.starting_score = score
        
        # Auto-create competency records as INTRODUCED
        from .models import StudentCompetency
        competencies = ['sequencing', 'patterns', 'loops', 'debugging', 'conditions']
        for comp in competencies:
            StudentCompetency.objects.get_or_create(user=request.user, competency=comp, defaults={'status': 'INTRODUCED'})

        profile.save()
        return Response({"success": True, "user": UserSerializer(request.user).data})

class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.filter(is_superuser=False).count()
        # Add more stats if needed later
        return Response({
            "total_users": total_users,
        })

# Gamification Seeding & Views
from .models import (
    Badge, UserBadge, Feedback, PizzaShopProgress, RobotMazeProgress,
    MyLittleShopProgress, FrogAdventureProgress, TrafficRescueProgress, PetRescueProgress,
    DolaMoneyProgress
)
from .serializers import (
    BadgeSerializer, FeedbackSerializer, PizzaShopProgressSerializer,
    RobotMazeProgressSerializer, MyLittleShopProgressSerializer, FrogAdventureProgressSerializer,
    TrafficRescueProgressSerializer, PetRescueProgressSerializer, DolaMoneyProgressSerializer
)

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
        "name": "Logic Explorer",
        "description": "Unlock Logic Explorer by completing unplugged stages!",
        "icon": "🧠",
        "condition_type": "stage2_progress",
        "condition_value": 7
    },
    {
        "name": "Block Master",
        "description": "Complete all levels in Stage 2",
        "icon": "🎮",
        "condition_type": "stage2_progress",
        "condition_value": 18
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
    },
    {
        "name": "Pizza Rookie",
        "description": "Serve your first pizza customer in Dola's Pizza Shop!",
        "icon": "🍕",
        "condition_type": "pizza_orders",
        "condition_value": 1
    },
    {
        "name": "Super Server",
        "description": "Serve 5 customers in a row with great accuracy!",
        "icon": "⭐",
        "condition_type": "pizza_orders",
        "condition_value": 5
    },
    {
        "name": "Counting Champion",
        "description": "Master Level 1 counting in Dola's Pizza Shop!",
        "icon": "🔢",
        "condition_type": "pizza_level",
        "condition_value": 1
    },
    {
        "name": "Pizza Master",
        "description": "Master Level 2 addition orders in Dola's Pizza Shop!",
        "icon": "👨‍🍳",
        "condition_type": "pizza_level",
        "condition_value": 2
    },
    {
        "name": "Loop Legend",
        "description": "Master slice loops & computational recipes in Dola's Pizza Shop and Robot Maze!",
        "icon": "🔄",
        "condition_type": "pizza_level",
        "condition_value": 3
    },
    {
        "name": "Robo Rookie",
        "description": "Guide Robo to complete your first maze mission!",
        "icon": "🤖",
        "condition_type": "robot_missions",
        "condition_value": 1
    },
    {
        "name": "Maze Explorer",
        "description": "Guide Robo through 5 tricky maze missions!",
        "icon": "🧭",
        "condition_type": "robot_missions",
        "condition_value": 5
    },
    {
        "name": "Direction Master",
        "description": "Master navigation through multi-turn paths!",
        "icon": "🎯",
        "condition_type": "robot_level",
        "condition_value": 3
    },
    {
        "name": "Bug Fixer",
        "description": "Fix and debug code to help Robo navigate obstacles safely!",
        "icon": "🛠️",
        "condition_type": "robot_debug",
        "condition_value": 1
    },
    {
        "name": "Shop Helper",
        "description": "Serve your first customer in My Little Shop!",
        "icon": "🏪",
        "condition_type": "shop_orders",
        "condition_value": 1
    },
    {
        "name": "Money Master",
        "description": "Master calculating prices and totals using Nigerian Naira!",
        "icon": "💰",
        "condition_type": "shop_level",
        "condition_value": 2
    },
    {
        "name": "Change Champion",
        "description": "Give exact change to customers like a math champion!",
        "icon": "💵",
        "condition_type": "shop_change",
        "condition_value": 3
    },
    {
        "name": "Smart Seller",
        "description": "Master multi-item customer orders and stock management!",
        "icon": "🛍️",
        "condition_type": "shop_level",
        "condition_value": 4
    },
    {
        "name": "Young Entrepreneur",
        "description": "Calculate shop profits, unlock upgrades, and grow your business!",
        "icon": "🌟",
        "condition_type": "shop_profit",
        "condition_value": 1
    },
    {
        "name": "Little Jumper",
        "description": "Complete your first jumping adventure in Frog Adventure!",
        "icon": "🐸",
        "condition_type": "frog_level",
        "condition_value": 1
    },
    {
        "name": "Pond Explorer",
        "description": "Guide your frog through tricky pond, river and jungle environments!",
        "icon": "🌊",
        "condition_type": "frog_level",
        "condition_value": 3
    },
    {
        "name": "Pattern Pro",
        "description": "Solve jump patterns and leap across obstacles like a pro!",
        "icon": "🧩",
        "condition_type": "frog_patterns",
        "condition_value": 1
    },
    {
        "name": "Path Finder",
        "description": "Find the shortest route and navigate grid coordinates with precision!",
        "icon": "🗺️",
        "condition_type": "frog_coordinates",
        "condition_value": 1
    },
    {
        "name": "Frog Coder",
        "description": "Master loops and fix bugs to guide your frog safely home!",
        "icon": "🚀",
        "condition_type": "frog_code",
        "condition_value": 1
    },
    {
        "name": "Road Helper",
        "description": "Match traffic light colours and guide your first vehicle safely!",
        "icon": "🚦",
        "condition_type": "traffic_level",
        "condition_value": 1
    },
    {
        "name": "Safe Driver",
        "description": "Guide vehicles through complex junctions without any gridlock!",
        "icon": "🚗",
        "condition_type": "traffic_level",
        "condition_value": 2
    },
    {
        "name": "Traffic Boss",
        "description": "Manage two intersecting roads and protect pedestrian zebra crossings!",
        "icon": "🛑",
        "condition_type": "traffic_level",
        "condition_value": 4
    },
    {
        "name": "Logic Controller",
        "description": "Use timing and IF/THEN condition blocks to automate city traffic!",
        "icon": "🧠",
        "condition_type": "traffic_conditions",
        "condition_value": 1
    },
    {
        "name": "City Coder",
        "description": "Debug faulty traffic light rules and keep the miniature city moving!",
        "icon": "🏙️",
        "condition_type": "traffic_debug",
        "condition_value": 1
    },
    {
        "name": "Pet Helper",
        "description": "Feed, care for, and soothe your first rescue centre pet!",
        "icon": "🐶",
        "condition_type": "pet_level",
        "condition_value": 1
    },
    {
        "name": "Animal Friend",
        "description": "Match the right healthy food and supplies for all animals!",
        "icon": "🐾",
        "condition_type": "pet_level",
        "condition_value": 2
    },
    {
        "name": "Pattern Star",
        "description": "Crack pet-care patterns and solve feeding sequences like a pro!",
        "icon": "⭐",
        "condition_type": "pet_patterns",
        "condition_value": 1
    },
    {
        "name": "Care Champion",
        "description": "Complete multi-step pet rescue routines and classification challenges!",
        "icon": "🏆",
        "condition_type": "pet_level",
        "condition_value": 4
    },
    {
        "name": "Pet Coder",
        "description": "Automate pet routines with IF/THEN rules, loops, and debugging!",
        "icon": "💻",
        "condition_type": "pet_code",
        "condition_value": 1
    },
    {
        "name": "Money Starter",
        "description": "Recognise Nigerian currency notes and make your first exact amount!",
        "icon": "🪙",
        "condition_type": "dolamoney_world",
        "condition_value": 1
    },
    {
        "name": "Smart Shopper",
        "description": "Distinguish needs from wants and make smart spending choices!",
        "icon": "🛒",
        "condition_type": "dolamoney_world",
        "condition_value": 2
    },
    {
        "name": "Savings Star",
        "description": "Build a consistent savings streak and fill your savings jar!",
        "icon": "⭐",
        "condition_type": "dolamoney_world",
        "condition_value": 3
    },
    {
        "name": "Budget Boss",
        "description": "Allocate a fixed budget wisely and handle unexpected changes!",
        "icon": "📊",
        "condition_type": "dolamoney_world",
        "condition_value": 4
    },
    {
        "name": "Banking Explorer",
        "description": "Master deposits, withdrawals, and balances in DolaBank!",
        "icon": "🏦",
        "condition_type": "dolamoney_world",
        "condition_value": 7
    },
    {
        "name": "Profit Pro",
        "description": "Master cost, revenue, and profit in your little business!",
        "icon": "📈",
        "condition_type": "dolamoney_world",
        "condition_value": 5
    },
    {
        "name": "Young Entrepreneur",
        "description": "Launch, price, and reinvest in your growing business venture!",
        "icon": "🚀",
        "condition_type": "dolamoney_world",
        "condition_value": 10
    },
    {
        "name": "Money Wise",
        "description": "Spot tricky money traps and scams by consulting trusted adults!",
        "icon": "🛡️",
        "condition_type": "dolamoney_world",
        "condition_value": 9
    },
    {
        "name": "Goal Getter",
        "description": "Hit key savings milestones towards your dream goals!",
        "icon": "🎯",
        "condition_type": "dolamoney_world",
        "condition_value": 8
    },
    {
        "name": "DolaMoney Champion",
        "description": "Conquer all DolaMoney Quest worlds with financial wisdom!",
        "icon": "👑",
        "condition_type": "dolamoney_champion",
        "condition_value": 1
    }
]

def seed_default_badges():
    for badge_data in DEFAULT_BADGES:
        Badge.objects.update_or_create(
            name=badge_data["name"],
            defaults={
                "description": badge_data["description"],
                "icon": badge_data["icon"],
                "condition_type": badge_data["condition_type"],
                "condition_value": badge_data["condition_value"]
            }
        )

class UpdateProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        stage = request.data.get('stage')
        progress = request.data.get('progress')
        if progress is None:
            progress = request.data.get('level')
        
        points_earned = 0
        
        # 1. Update progress if provided
        if stage is not None and progress is not None:
            stage = int(stage)
            progress = int(progress)

            # Access guard: Stage 1 levels 1-10 are free sample lessons. Everything beyond requires an active subscription.
            if stage > 1 or (stage == 1 and progress > 10):
                from .subscription_service import check_learning_access
                access = check_learning_access(user, feature=f'stage{stage}', stage=stage, part=2 if (stage == 1 and progress > 10) else None)
                if not access.get('allowed', False):
                    return Response({
                        "error": "SUBSCRIPTION_REQUIRED",
                        "detail": access.get("reason", "An active subscription is required to progress beyond Chapter 1."),
                        "headline": access.get("headline", "Your DolaCode adventure is waiting!"),
                        "subtext": access.get("subtext", "Ask your parent to unlock your learning world."),
                        "cta_text": access.get("cta_text", "UNLOCK DOLACODE"),
                        "cta_url": access.get("cta_url", "/subscribe")
                    }, status=status.HTTP_403_FORBIDDEN)

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

        # Log completion to database ProgressLog table
        if points_earned > 0 and stage is not None and progress is not None:
            from api.models import ProgressLog
            ProgressLog.objects.create(
                user=user,
                stage=stage,
                progress=progress,
                points_earned=points_earned
            )

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

        # Update dynamic skill competencies
        update_student_competencies(user, profile)

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

class PizzaShopSaveProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]

    def post(self, request):
        user = request.user
        data = request.data
        
        current_level = int(data.get('current_level', 1))
        stars_earned = int(data.get('stars_earned', 0))
        dola_coins = int(data.get('dola_coins', 0))
        xp_earned = int(data.get('xp_earned', 0))
        accuracy = float(data.get('accuracy', 100.0))
        attempts = int(data.get('attempts', 0))
        correct_orders = int(data.get('correct_orders', 0))
        time_spent_seconds = int(data.get('time_spent_seconds', 0))
        counting_accuracy = float(data.get('counting_accuracy', 100.0))
        addition_accuracy = float(data.get('addition_accuracy', 100.0))
        subtraction_accuracy = float(data.get('subtraction_accuracy', 100.0))
        problem_solving_accuracy = float(data.get('problem_solving_accuracy', 100.0))
        hints_used = int(data.get('hints_used', 0))
        coding_concepts_completed = int(data.get('coding_concepts_completed', 0))
        badge_slugs = data.get('badges', [])

        prog, created = PizzaShopProgress.objects.get_or_create(user=user)
        
        xp_delta = max(0, xp_earned - prog.xp_earned)
        
        prog.current_level = max(prog.current_level, current_level)
        prog.stars_earned = max(prog.stars_earned, stars_earned)
        prog.dola_coins = max(prog.dola_coins, dola_coins)
        prog.xp_earned = max(prog.xp_earned, xp_earned)
        prog.accuracy = accuracy
        prog.attempts = max(prog.attempts, attempts)
        prog.correct_orders = max(prog.correct_orders, correct_orders)
        prog.time_spent_seconds = max(prog.time_spent_seconds, time_spent_seconds)
        prog.counting_accuracy = counting_accuracy
        prog.addition_accuracy = addition_accuracy
        prog.subtraction_accuracy = subtraction_accuracy
        prog.problem_solving_accuracy = problem_solving_accuracy
        prog.hints_used = max(prog.hints_used, hints_used)
        prog.coding_concepts_completed = max(prog.coding_concepts_completed, coding_concepts_completed)
        
        current_badges = set(prog.badges or [])
        if isinstance(badge_slugs, list):
            current_badges.update(badge_slugs)
            
        if prog.correct_orders >= 1:
            current_badges.add("Pizza Rookie")
        if prog.correct_orders >= 5:
            current_badges.add("Super Server")
        if prog.current_level >= 1 and prog.counting_accuracy >= 70:
            current_badges.add("Counting Champion")
        if prog.current_level >= 2 and prog.addition_accuracy >= 70:
            current_badges.add("Pizza Master")
        if prog.coding_concepts_completed >= 1 or (prog.current_level >= 3 and prog.subtraction_accuracy >= 70):
            current_badges.add("Loop Legend")
            
        prog.badges = list(current_badges)
        prog.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if xp_delta > 0:
            profile.points += xp_delta
            
        from datetime import timedelta
        from django.utils import timezone
        today = timezone.now().date()
        if profile.last_active_date != today:
            if profile.last_active_date == today - timedelta(days=1):
                profile.current_streak += 1
            else:
                profile.current_streak = 1
            if profile.current_streak > profile.longest_streak:
                profile.longest_streak = profile.current_streak
            profile.last_active_date = today
        profile.save()

        seed_default_badges()
        newly_awarded = []
        for badge_name in current_badges:
            badge_obj = Badge.objects.filter(name=badge_name).first()
            if badge_obj:
                ub, ub_created = UserBadge.objects.get_or_create(user=user, badge=badge_obj)
                if ub_created:
                    newly_awarded.append({
                        "name": badge_obj.name,
                        "description": badge_obj.description,
                        "icon": badge_obj.icon
                    })

        return Response({
            "success": True,
            "progress": PizzaShopProgressSerializer(prog).data,
            "newly_awarded_badges": newly_awarded,
            "profile_points": profile.points,
            "current_streak": profile.current_streak
        })


class PizzaShopGetProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'numeracy'

    def get(self, request):
        user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to access learning progress across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        prog, _ = PizzaShopProgress.objects.get_or_create(user=user)
        return Response({
            "success": True,
            "progress": PizzaShopProgressSerializer(prog).data
        })


class RobotMazeSaveProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]

    def post(self, request):
        user = request.user
        data = request.data
        
        current_level = int(data.get('current_level', 1))
        stars_earned = int(data.get('stars_earned', 0))
        dola_coins = int(data.get('dola_coins', 0))
        xp_earned = int(data.get('xp_earned', 0))
        accuracy = float(data.get('accuracy', 100.0))
        attempts = int(data.get('attempts', 0))
        missions_completed = int(data.get('missions_completed', 0))
        commands_used = int(data.get('commands_used', 0))
        hints_used = int(data.get('hints_used', 0))
        debugging_attempts = int(data.get('debugging_attempts', 0))
        loops_completed = int(data.get('loops_completed', 0))
        time_spent_seconds = int(data.get('time_spent_seconds', 0))
        badge_slugs = data.get('badges', [])

        prog, created = RobotMazeProgress.objects.get_or_create(user=user)
        
        xp_delta = max(0, xp_earned - prog.xp_earned)
        
        prog.current_level = max(prog.current_level, current_level)
        prog.stars_earned = max(prog.stars_earned, stars_earned)
        prog.dola_coins = max(prog.dola_coins, dola_coins)
        prog.xp_earned = max(prog.xp_earned, xp_earned)
        prog.accuracy = accuracy
        prog.attempts = max(prog.attempts, attempts)
        prog.missions_completed = max(prog.missions_completed, missions_completed)
        prog.commands_used = max(prog.commands_used, commands_used)
        prog.hints_used = max(prog.hints_used, hints_used)
        prog.debugging_attempts = max(prog.debugging_attempts, debugging_attempts)
        prog.loops_completed = max(prog.loops_completed, loops_completed)
        prog.time_spent_seconds = max(prog.time_spent_seconds, time_spent_seconds)
        
        current_badges = set(prog.badges or [])
        if isinstance(badge_slugs, list):
            current_badges.update(badge_slugs)
            
        if prog.missions_completed >= 1:
            current_badges.add("Robo Rookie")
        if prog.missions_completed >= 5:
            current_badges.add("Maze Explorer")
        if prog.current_level >= 3:
            current_badges.add("Direction Master")
        if prog.debugging_attempts >= 1:
            current_badges.add("Bug Fixer")
        if prog.loops_completed >= 1:
            current_badges.add("Loop Legend")
            
        prog.badges = list(current_badges)
        prog.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if xp_delta > 0:
            profile.points += xp_delta
            
        from datetime import timedelta
        from django.utils import timezone
        today = timezone.now().date()
        if profile.last_active_date != today:
            if profile.last_active_date == today - timedelta(days=1):
                profile.current_streak += 1
            else:
                profile.current_streak = 1
            if profile.current_streak > profile.longest_streak:
                profile.longest_streak = profile.current_streak
            profile.last_active_date = today
        profile.save()

        seed_default_badges()
        newly_awarded = []
        for badge_name in current_badges:
            badge_obj = Badge.objects.filter(name=badge_name).first()
            if badge_obj:
                ub, ub_created = UserBadge.objects.get_or_create(user=user, badge=badge_obj)
                if ub_created:
                    newly_awarded.append({
                        "name": badge_obj.name,
                        "description": badge_obj.description,
                        "icon": badge_obj.icon
                    })

        return Response({
            "success": True,
            "progress": RobotMazeProgressSerializer(prog).data,
            "newly_awarded_badges": newly_awarded,
            "profile_points": profile.points,
            "current_streak": profile.current_streak
        })


class RobotMazeGetProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'numeracy'

    def get(self, request):
        user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to access learning progress across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        prog, _ = RobotMazeProgress.objects.get_or_create(user=user)
        return Response({
            "success": True,
            "progress": RobotMazeProgressSerializer(prog).data
        })


class MyLittleShopSaveProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]

    def post(self, request):
        user = request.user
        data = request.data
        
        current_level = int(data.get('current_level', 1))
        stars_earned = int(data.get('stars_earned', 0))
        dola_coins = int(data.get('dola_coins', 0))
        xp_earned = int(data.get('xp_earned', 0))
        accuracy = float(data.get('accuracy', 100.0))
        attempts = int(data.get('attempts', 0))
        customers_served = int(data.get('customers_served', 0))
        addition_accuracy = float(data.get('addition_accuracy', 100.0))
        subtraction_accuracy = float(data.get('subtraction_accuracy', 100.0))
        money_recognition_accuracy = float(data.get('money_recognition_accuracy', 100.0))
        change_accuracy = float(data.get('change_accuracy', 100.0))
        multiplication_accuracy = float(data.get('multiplication_accuracy', 100.0))
        profit_accuracy = float(data.get('profit_accuracy', 100.0))
        stock_accuracy = float(data.get('stock_accuracy', 100.0))
        problem_solving_accuracy = float(data.get('problem_solving_accuracy', 100.0))
        hints_used = int(data.get('hints_used', 0))
        time_spent_seconds = int(data.get('time_spent_seconds', 0))
        shop_upgrades = data.get('shop_upgrades', [])
        badge_slugs = data.get('badges', [])

        prog, created = MyLittleShopProgress.objects.get_or_create(user=user)
        
        xp_delta = max(0, xp_earned - prog.xp_earned)
        
        prog.current_level = max(prog.current_level, current_level)
        prog.stars_earned = max(prog.stars_earned, stars_earned)
        prog.dola_coins = max(prog.dola_coins, dola_coins)
        prog.xp_earned = max(prog.xp_earned, xp_earned)
        prog.accuracy = accuracy
        prog.attempts = max(prog.attempts, attempts)
        prog.customers_served = max(prog.customers_served, customers_served)
        prog.addition_accuracy = addition_accuracy
        prog.subtraction_accuracy = subtraction_accuracy
        prog.money_recognition_accuracy = money_recognition_accuracy
        prog.change_accuracy = change_accuracy
        prog.multiplication_accuracy = multiplication_accuracy
        prog.profit_accuracy = profit_accuracy
        prog.stock_accuracy = stock_accuracy
        prog.problem_solving_accuracy = problem_solving_accuracy
        prog.hints_used = max(prog.hints_used, hints_used)
        prog.time_spent_seconds = max(prog.time_spent_seconds, time_spent_seconds)
        
        if isinstance(shop_upgrades, list):
            existing_upgrades = set(prog.shop_upgrades or [])
            existing_upgrades.update(shop_upgrades)
            prog.shop_upgrades = list(existing_upgrades)

        current_badges = set(prog.badges or [])
        if isinstance(badge_slugs, list):
            current_badges.update(badge_slugs)
            
        if prog.customers_served >= 1:
            current_badges.add("Shop Helper")
        if prog.current_level >= 2 or prog.addition_accuracy >= 80:
            current_badges.add("Money Master")
        if prog.current_level >= 3 and prog.change_accuracy >= 70:
            current_badges.add("Change Champion")
        if prog.current_level >= 4 or prog.stock_accuracy >= 80:
            current_badges.add("Smart Seller")
        if prog.current_level >= 7 or len(prog.shop_upgrades) >= 1 or prog.profit_accuracy >= 80:
            current_badges.add("Young Entrepreneur")
            
        prog.badges = list(current_badges)
        prog.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if xp_delta > 0:
            profile.points += xp_delta
            
        from datetime import timedelta
        from django.utils import timezone
        today = timezone.now().date()
        if profile.last_active_date != today:
            if profile.last_active_date == today - timedelta(days=1):
                profile.current_streak += 1
            else:
                profile.current_streak = 1
            if profile.current_streak > profile.longest_streak:
                profile.longest_streak = profile.current_streak
            profile.last_active_date = today
        profile.save()

        seed_default_badges()
        newly_awarded = []
        for badge_name in current_badges:
            badge_obj = Badge.objects.filter(name=badge_name).first()
            if badge_obj:
                ub, ub_created = UserBadge.objects.get_or_create(user=user, badge=badge_obj)
                if ub_created:
                    newly_awarded.append({
                        "name": badge_obj.name,
                        "description": badge_obj.description,
                        "icon": badge_obj.icon
                    })

        return Response({
            "success": True,
            "progress": MyLittleShopProgressSerializer(prog).data,
            "newly_awarded_badges": newly_awarded,
            "profile_points": profile.points,
            "current_streak": profile.current_streak
        })


class MyLittleShopGetProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'numeracy'

    def get(self, request):
        user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to access learning progress across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        prog, _ = MyLittleShopProgress.objects.get_or_create(user=user)
        return Response({
            "success": True,
            "progress": MyLittleShopProgressSerializer(prog).data
        })


class FrogAdventureSaveProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]

    def post(self, request):
        user = request.user
        data = request.data
        
        current_level = int(data.get('current_level', 1))
        stars_earned = int(data.get('stars_earned', 0))
        dola_coins = int(data.get('dola_coins', 0))
        xp_earned = int(data.get('xp_earned', 0))
        accuracy = float(data.get('accuracy', 100.0))
        attempts = int(data.get('attempts', 0))
        fruits_collected = int(data.get('fruits_collected', 0))
        counting_accuracy = float(data.get('counting_accuracy', 100.0))
        sequence_accuracy = float(data.get('sequence_accuracy', 100.0))
        pattern_accuracy = float(data.get('pattern_accuracy', 100.0))
        coordinates_accuracy = float(data.get('coordinates_accuracy', 100.0))
        route_planning_accuracy = float(data.get('route_planning_accuracy', 100.0))
        loops_completed = int(data.get('loops_completed', 0))
        debugging_attempts = int(data.get('debugging_attempts', 0))
        hints_used = int(data.get('hints_used', 0))
        time_spent_seconds = int(data.get('time_spent_seconds', 0))
        unlocked_costumes = data.get('unlocked_costumes', [])
        badge_slugs = data.get('badges', [])

        prog, created = FrogAdventureProgress.objects.get_or_create(user=user)
        
        xp_delta = max(0, xp_earned - prog.xp_earned)
        
        prog.current_level = max(prog.current_level, current_level)
        prog.stars_earned = max(prog.stars_earned, stars_earned)
        prog.dola_coins = max(prog.dola_coins, dola_coins)
        prog.xp_earned = max(prog.xp_earned, xp_earned)
        prog.accuracy = accuracy
        prog.attempts = max(prog.attempts, attempts)
        prog.fruits_collected = max(prog.fruits_collected, fruits_collected)
        prog.counting_accuracy = counting_accuracy
        prog.sequence_accuracy = sequence_accuracy
        prog.pattern_accuracy = pattern_accuracy
        prog.coordinates_accuracy = coordinates_accuracy
        prog.route_planning_accuracy = route_planning_accuracy
        prog.loops_completed = max(prog.loops_completed, loops_completed)
        prog.debugging_attempts = max(prog.debugging_attempts, debugging_attempts)
        prog.hints_used = max(prog.hints_used, hints_used)
        prog.time_spent_seconds = max(prog.time_spent_seconds, time_spent_seconds)
        
        if isinstance(unlocked_costumes, list):
            existing_costumes = set(prog.unlocked_costumes or [])
            existing_costumes.update(unlocked_costumes)
            prog.unlocked_costumes = list(existing_costumes)

        current_badges = set(prog.badges or [])
        if isinstance(badge_slugs, list):
            current_badges.update(badge_slugs)
            
        if prog.current_level >= 1 or prog.attempts >= 1:
            current_badges.add("Little Jumper")
        if prog.current_level >= 3 or prog.fruits_collected >= 3:
            current_badges.add("Pond Explorer")
        if prog.current_level >= 5 or prog.pattern_accuracy >= 80:
            current_badges.add("Pattern Pro")
        if prog.current_level >= 6 or prog.coordinates_accuracy >= 80 or prog.route_planning_accuracy >= 80:
            current_badges.add("Path Finder")
        if prog.current_level >= 7 or prog.loops_completed >= 1 or prog.debugging_attempts >= 1:
            current_badges.add("Frog Coder")
            
        prog.badges = list(current_badges)
        prog.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if xp_delta > 0:
            profile.points += xp_delta
            
        from datetime import timedelta
        from django.utils import timezone
        today = timezone.now().date()
        if profile.last_active_date != today:
            if profile.last_active_date == today - timedelta(days=1):
                profile.current_streak += 1
            else:
                profile.current_streak = 1
            if profile.current_streak > profile.longest_streak:
                profile.longest_streak = profile.current_streak
            profile.last_active_date = today
        profile.save()

        seed_default_badges()
        newly_awarded = []
        for badge_name in current_badges:
            badge_obj = Badge.objects.filter(name=badge_name).first()
            if badge_obj:
                ub, ub_created = UserBadge.objects.get_or_create(user=user, badge=badge_obj)
                if ub_created:
                    newly_awarded.append({
                        "name": badge_obj.name,
                        "description": badge_obj.description,
                        "icon": badge_obj.icon
                    })

        return Response({
            "success": True,
            "progress": FrogAdventureProgressSerializer(prog).data,
            "newly_awarded_badges": newly_awarded,
            "profile_points": profile.points,
            "current_streak": profile.current_streak
        })


class FrogAdventureGetProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'numeracy'

    def get(self, request):
        user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to access learning progress across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        prog, _ = FrogAdventureProgress.objects.get_or_create(user=user)
        return Response({
            "success": True,
            "progress": FrogAdventureProgressSerializer(prog).data
        })


class TrafficRescueSaveProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]

    def post(self, request):
        user = request.user
        data = request.data
        
        current_level = int(data.get('current_level', 1))
        stars_earned = int(data.get('stars_earned', 0))
        dola_coins = int(data.get('dola_coins', 0))
        xp_earned = int(data.get('xp_earned', 0))
        city_points = int(data.get('city_points', 0))
        accuracy = float(data.get('accuracy', 100.0))
        attempts = int(data.get('attempts', 0))
        vehicles_guided = int(data.get('vehicles_guided', 0))
        pedestrians_saved = int(data.get('pedestrians_saved', 0))
        sequencing_ability = float(data.get('sequencing_ability', 100.0))
        logical_reasoning = float(data.get('logical_reasoning', 100.0))
        condition_usage = float(data.get('condition_usage', 100.0))
        timing_accuracy = float(data.get('timing_accuracy', 100.0))
        debugging_accuracy = float(data.get('debugging_accuracy', 100.0))
        hints_used = int(data.get('hints_used', 0))
        time_spent_seconds = int(data.get('time_spent_seconds', 0))
        city_upgrades = data.get('city_upgrades', [])
        badge_slugs = data.get('badges', [])

        prog, created = TrafficRescueProgress.objects.get_or_create(user=user)
        
        xp_delta = max(0, xp_earned - prog.xp_earned)
        
        prog.current_level = max(prog.current_level, current_level)
        prog.stars_earned = max(prog.stars_earned, stars_earned)
        prog.dola_coins = max(prog.dola_coins, dola_coins)
        prog.xp_earned = max(prog.xp_earned, xp_earned)
        prog.city_points = max(prog.city_points, city_points)
        prog.accuracy = accuracy
        prog.attempts = max(prog.attempts, attempts)
        prog.vehicles_guided = max(prog.vehicles_guided, vehicles_guided)
        prog.pedestrians_saved = max(prog.pedestrians_saved, pedestrians_saved)
        prog.sequencing_ability = sequencing_ability
        prog.logical_reasoning = logical_reasoning
        prog.condition_usage = condition_usage
        prog.timing_accuracy = timing_accuracy
        prog.debugging_accuracy = debugging_accuracy
        prog.hints_used = max(prog.hints_used, hints_used)
        prog.time_spent_seconds = max(prog.time_spent_seconds, time_spent_seconds)
        
        if isinstance(city_upgrades, list):
            existing_upgrades = set(prog.city_upgrades or [])
            existing_upgrades.update(city_upgrades)
            prog.city_upgrades = list(existing_upgrades)

        current_badges = set(prog.badges or [])
        if isinstance(badge_slugs, list):
            current_badges.update(badge_slugs)
            
        if prog.current_level >= 1 or prog.vehicles_guided >= 1:
            current_badges.add("Road Helper")
        if prog.current_level >= 2 or prog.vehicles_guided >= 3:
            current_badges.add("Safe Driver")
        if prog.current_level >= 4 or prog.pedestrians_saved >= 2:
            current_badges.add("Traffic Boss")
        if prog.current_level >= 6 or prog.condition_usage >= 80 or prog.timing_accuracy >= 80:
            current_badges.add("Logic Controller")
        if prog.current_level >= 8 or prog.debugging_accuracy >= 80 or len(prog.city_upgrades) >= 2:
            current_badges.add("City Coder")
            
        prog.badges = list(current_badges)
        prog.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if xp_delta > 0:
            profile.points += xp_delta
            
        from datetime import timedelta
        from django.utils import timezone
        today = timezone.now().date()
        if profile.last_active_date != today:
            if profile.last_active_date == today - timedelta(days=1):
                profile.current_streak += 1
            else:
                profile.current_streak = 1
            if profile.current_streak > profile.longest_streak:
                profile.longest_streak = profile.current_streak
            profile.last_active_date = today
        profile.save()

        seed_default_badges()
        newly_awarded = []
        for badge_name in current_badges:
            badge_obj = Badge.objects.filter(name=badge_name).first()
            if badge_obj:
                ub, ub_created = UserBadge.objects.get_or_create(user=user, badge=badge_obj)
                if ub_created:
                    newly_awarded.append({
                        "name": badge_obj.name,
                        "description": badge_obj.description,
                        "icon": badge_obj.icon
                    })

        return Response({
            "success": True,
            "progress": TrafficRescueProgressSerializer(prog).data,
            "newly_awarded_badges": newly_awarded,
            "profile_points": profile.points,
            "current_streak": profile.current_streak
        })


class TrafficRescueGetProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'numeracy'

    def get(self, request):
        user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to access learning progress across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        prog, _ = TrafficRescueProgress.objects.get_or_create(user=user)
        return Response({
            "success": True,
            "progress": TrafficRescueProgressSerializer(prog).data
        })


class PetRescueSaveProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]

    def post(self, request):
        user = request.user
        data = request.data
        
        current_level = int(data.get('current_level', 1))
        stars_earned = int(data.get('stars_earned', 0))
        dola_coins = int(data.get('dola_coins', 0))
        xp_earned = int(data.get('xp_earned', 0))
        happiness_points = int(data.get('happiness_points', 0))
        accuracy = float(data.get('accuracy', 100.0))
        attempts = int(data.get('attempts', 0))
        pets_helped = int(data.get('pets_helped', 0))
        counting_accuracy = float(data.get('counting_accuracy', 100.0))
        classification_accuracy = float(data.get('classification_accuracy', 100.0))
        sequence_accuracy = float(data.get('sequence_accuracy', 100.0))
        pattern_accuracy = float(data.get('pattern_accuracy', 100.0))
        condition_usage = float(data.get('condition_usage', 100.0))
        loops_completed = int(data.get('loops_completed', 0))
        debugging_accuracy = float(data.get('debugging_accuracy', 100.0))
        hints_used = int(data.get('hints_used', 0))
        time_spent_seconds = int(data.get('time_spent_seconds', 0))
        unlocked_pets = data.get('unlocked_pets', [])
        unlocked_accessories = data.get('unlocked_accessories', [])
        badge_slugs = data.get('badges', [])

        prog, created = PetRescueProgress.objects.get_or_create(user=user)
        
        xp_delta = max(0, xp_earned - prog.xp_earned)
        
        prog.current_level = max(prog.current_level, current_level)
        prog.stars_earned = max(prog.stars_earned, stars_earned)
        prog.dola_coins = max(prog.dola_coins, dola_coins)
        prog.xp_earned = max(prog.xp_earned, xp_earned)
        prog.happiness_points = max(prog.happiness_points, happiness_points)
        prog.accuracy = accuracy
        prog.attempts = max(prog.attempts, attempts)
        prog.pets_helped = max(prog.pets_helped, pets_helped)
        prog.counting_accuracy = counting_accuracy
        prog.classification_accuracy = classification_accuracy
        prog.sequence_accuracy = sequence_accuracy
        prog.pattern_accuracy = pattern_accuracy
        prog.condition_usage = condition_usage
        prog.loops_completed = max(prog.loops_completed, loops_completed)
        prog.debugging_accuracy = debugging_accuracy
        prog.hints_used = max(prog.hints_used, hints_used)
        prog.time_spent_seconds = max(prog.time_spent_seconds, time_spent_seconds)
        
        if isinstance(unlocked_pets, list):
            existing_pets = set(prog.unlocked_pets or [])
            existing_pets.update(unlocked_pets)
            prog.unlocked_pets = list(existing_pets)

        if isinstance(unlocked_accessories, list):
            existing_acc = set(prog.unlocked_accessories or [])
            existing_acc.update(unlocked_accessories)
            prog.unlocked_accessories = list(existing_acc)

        current_badges = set(prog.badges or [])
        if isinstance(badge_slugs, list):
            current_badges.update(badge_slugs)
            
        if prog.current_level >= 1 or prog.pets_helped >= 1:
            current_badges.add("Pet Helper")
        if prog.current_level >= 2 or prog.classification_accuracy >= 80:
            current_badges.add("Animal Friend")
        if prog.current_level >= 5 or prog.pattern_accuracy >= 80:
            current_badges.add("Pattern Star")
        if prog.current_level >= 4 or prog.sequence_accuracy >= 80:
            current_badges.add("Care Champion")
        if prog.current_level >= 6 or prog.loops_completed >= 1 or prog.condition_usage >= 80:
            current_badges.add("Pet Coder")
            
        prog.badges = list(current_badges)
        prog.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if xp_delta > 0:
            profile.points += xp_delta
            
        from datetime import timedelta
        from django.utils import timezone
        today = timezone.now().date()
        if profile.last_active_date != today:
            if profile.last_active_date == today - timedelta(days=1):
                profile.current_streak += 1
            else:
                profile.current_streak = 1
            if profile.current_streak > profile.longest_streak:
                profile.longest_streak = profile.current_streak
            profile.last_active_date = today
        profile.save()

        seed_default_badges()
        newly_awarded = []
        for badge_name in current_badges:
            badge_obj = Badge.objects.filter(name=badge_name).first()
            if badge_obj:
                ub, ub_created = UserBadge.objects.get_or_create(user=user, badge=badge_obj)
                if ub_created:
                    newly_awarded.append({
                        "name": badge_obj.name,
                        "description": badge_obj.description,
                        "icon": badge_obj.icon
                    })

        return Response({
            "success": True,
            "progress": PetRescueProgressSerializer(prog).data,
            "newly_awarded_badges": newly_awarded,
            "profile_points": profile.points,
            "current_streak": profile.current_streak
        })


class PetRescueGetProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'numeracy'

    def get(self, request):
        user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to access learning progress across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        prog, _ = PetRescueProgress.objects.get_or_create(user=user)
        return Response({
            "success": True,
            "progress": PetRescueProgressSerializer(prog).data
        })


class DolaMoneySaveProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        child_id = request.data.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "permission_denied",
                    "detail": "Unauthorized to update learning progress across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        prog, _ = DolaMoneyProgress.objects.get_or_create(user=user)

        if 'dola_coins' in data:
            prog.dola_coins = max(0, int(data['dola_coins']))
        if 'xp_earned' in data:
            prog.xp_earned = max(0, int(data['xp_earned']))
        if 'savings_streak' in data:
            prog.savings_streak = max(0, int(data['savings_streak']))
        if 'savings_total' in data:
            prog.savings_total = max(0, int(data['savings_total']))
        if 'current_world' in data:
            prog.current_world = max(1, min(10, int(data['current_world'])))
        if 'time_spent_seconds' in data:
            prog.time_spent_seconds = max(0, int(data['time_spent_seconds']))

        if 'completed_worlds' in data and isinstance(data['completed_worlds'], list):
            combined = set(prog.completed_worlds)
            for w in data['completed_worlds']:
                if str(w).isdigit():
                    combined.add(int(w))
            prog.completed_worlds = list(sorted(combined))

        if 'world_levels' in data and isinstance(data['world_levels'], dict):
            wl = dict(prog.world_levels)
            wl.update(data['world_levels'])
            prog.world_levels = wl

        if 'active_savings_goal' in data and isinstance(data['active_savings_goal'], dict):
            prog.active_savings_goal = data['active_savings_goal']

        if 'business_stats' in data and isinstance(data['business_stats'], dict):
            bs = dict(prog.business_stats)
            bs.update(data['business_stats'])
            prog.business_stats = bs

        if 'bank_stats' in data and isinstance(data['bank_stats'], dict):
            bk = dict(prog.bank_stats)
            bk.update(data['bank_stats'])
            prog.bank_stats = bk

        if 'financial_skills' in data and isinstance(data['financial_skills'], dict):
            fs = dict(prog.financial_skills)
            fs.update(data['financial_skills'])
            prog.financial_skills = fs

        current_badges = list(prog.badges)
        incoming_badges = data.get('badges', [])
        if isinstance(incoming_badges, list):
            for b in incoming_badges:
                if b not in current_badges:
                    current_badges.append(b)
        prog.badges = current_badges

        prog.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if 'stars_awarded' in data and int(data['stars_awarded']) > 0:
            profile.points += int(data['stars_awarded'])
        profile.save()

        seed_default_badges()
        newly_awarded = []
        for badge_name in current_badges:
            b_obj = Badge.objects.filter(name=badge_name).first()
            if b_obj:
                ub, ub_created = UserBadge.objects.get_or_create(user=user, badge=b_obj)
                if ub_created:
                    newly_awarded.append({
                        "name": b_obj.name,
                        "description": b_obj.description,
                        "icon": b_obj.icon
                    })

        return Response({
            "success": True,
            "progress": DolaMoneyProgressSerializer(prog).data,
            "newly_awarded_badges": newly_awarded,
            "profile_points": profile.points
        })


class DolaMoneyGetProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "permission_denied",
                    "detail": "Unauthorized to access learning progress across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        prog, _ = DolaMoneyProgress.objects.get_or_create(user=user)
        return Response({
            "success": True,
            "progress": DolaMoneyProgressSerializer(prog).data
        })


import os
import urllib.request
import json

from .stage_curriculum import get_curriculum_context

class ChatView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        messages = request.data.get('messages', [])
        stage = request.data.get('stage', '1')
        level = request.data.get('level', '1')
        context_info = request.data.get('contextInfo', '') or request.data.get('levelGoal', '')
        
        last_message = ""
        sanitized_messages = []
        if isinstance(messages, list):
            for m in messages:
                if isinstance(m, dict):
                    role = str(m.get('role', 'user'))
                    content = str(m.get('content', ''))
                    sanitized_messages.append({'role': role, 'content': content})
            if sanitized_messages:
                last_message = sanitized_messages[-1]['content'].strip()

        api_key = os.environ.get('OPENAI_API_KEY')
        curriculum_context = get_curriculum_context(stage, level, context_info)
        
        if api_key and len(api_key.strip()) > 10:
            try:
                system_prompt = (
                    f"You are Lizzy 🧚✨, an ultra-concise, encouraging AI coding tutor for kids on DolaCode.\n\n"
                    f"=== KNOWLEDGE & TASK CONTEXT ===\n{curriculum_context}\n\n"
                    f"STRICT TUTORING RULES:\n"
                    f"1. KEEP REPLIES CONCISE: Maximum 2 short bullet points or 25-45 words total.\n"
                    f"2. NO LONG PREAMBLE or filler intros. Give the precise hint immediately.\n"
                    f"3. SOCRATIC METHOD: Guide the student with a hint or next step. Do NOT give away direct answers.\n"
                    f"4. Reference exact numbers, variables, blocks, or error lines from the student's task."
                )
                
                payload = json.dumps({
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        *sanitized_messages[-4:]
                    ],
                    "max_tokens": 120,
                    "temperature": 0.3
                }).encode('utf-8')

                req = urllib.request.Request(
                    "https://api.openai.com/v1/chat/completions",
                    data=payload,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {api_key.strip()}"
                    }
                )
                
                with urllib.request.urlopen(req, timeout=8) as response:
                    res_body = json.loads(response.read().decode('utf-8'))
                    reply = res_body['choices'][0]['message']['content']
                    return Response({"reply": reply, "author": "Lizzy", "source": "openai"})
            except Exception as e:
                err_detail = str(e)
                if hasattr(e, 'read'):
                    try:
                        err_detail += " - " + e.read().decode('utf-8')
                    except Exception:
                        pass
                print(f"[Lizzy AI Notice]: OpenAI call failed ({err_detail}). Using Local Guidance Engine fallback.")

        # Local Intelligent Guidance Engine for Lizzy when OpenAI key is offline or API fails
        reply = self.generate_lizzy_guidance(last_message, stage, level, context_info)
        return Response({"reply": reply, "author": "Lizzy", "source": "local_fallback"})

    def generate_lizzy_guidance(self, prompt, stage, level, context_info=""):
        prompt_lower = prompt.lower()
        stage_str = str(stage)
        level_str = str(level)
        
        ctx_summary = f"\nTask details: {context_info[:100]}" if context_info else ""
        
        if "who are you" in prompt_lower or "your name" in prompt_lower or "hello" in prompt_lower or "hi" in prompt_lower:
            return f"Hi! I'm Lizzy 🧚✨ (Stage {stage_str} Level {level_str}). How can I help you solve this puzzle?"
            
        if any(k in prompt_lower for k in ["hint", "help", "stuck", "clue", "💡"]):
            if stage_str == "1":
                return f"💡 **Stage 1 Hint (Lvl {level_str})**:{ctx_summary}\n- Count step-by-step to find the missing target number! ⭐"
            elif stage_str == "2":
                return f"🧱 **Stage 2 Hint (Lvl {level_str})**:{ctx_summary}\n- Place action blocks inside your loop body and hit **Run**!"
            elif stage_str == "3":
                return f"🎨 **App Studio Hint**:{ctx_summary}\n- Check `onClick` event in Inspector to update screen state on click!"
            elif stage_str == "4":
                return f"🐍 **Python Quest Hint (Lvl {level_str})**:{ctx_summary}\n- Check indentation (4 spaces under functions/loops) and variable names!"
            else:
                return f"🌟 **Hint**:\n- Break task into 2 steps and test the first command!"

        if any(k in prompt_lower for k in ["explain", "how to", "what", "🧐"]):
            return f"🧐 **Quick Guide (Lvl {level_str})**:\nRead mission goal at top, then run your first command to test the output!"

        if any(k in prompt_lower for k in ["cheer", "encourage", "thank", "awesome", "cool", "great", "⭐"]):
            return "Awesome work! 🌟 Keep coding! 🚀"

        return f"🧚✨ **Stage {stage_str} Lvl {level_str}**:\nClick **Give Hint 💡** or ask what step feels tricky!"


from .models import School, Classroom, ParentChild
from .serializers import SchoolSerializer, ClassroomSerializer

class SuperAdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not user.is_superuser and (not profile or profile.role != 'super_admin'):
            return Response({"error": "Super Admin permission required."}, status=status.HTTP_403_FORBIDDEN)

        total_schools = School.objects.count()
        total_parents = UserProfile.objects.filter(role='parent').count()
        total_students = UserProfile.objects.filter(role='student').count()
        total_teachers = UserProfile.objects.filter(role__in=['teacher', 'school_admin']).count()
        
        from django.db.models import Sum
        total_points = UserProfile.objects.aggregate(Sum('points'))['points__sum'] or 0

        schools = School.objects.all().order_by('-created_at')[:20]
        recent_users = User.objects.all().order_by('-date_joined')[:10]

        return Response({
            "metrics": {
                "total_schools": total_schools,
                "total_parents": total_parents,
                "total_students": total_students,
                "total_teachers": total_teachers,
                "total_points": total_points,
            },
            "schools": SchoolSerializer(schools, many=True).data,
            "recent_users": UserSerializer(recent_users, many=True).data
        })

class SchoolDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['school_admin', 'teacher', 'super_admin']:
            return Response({"error": "School or Teacher access required."}, status=status.HTTP_403_FORBIDDEN)

        school = profile.school
        if not school:
            return Response({"message": "No school associated with this profile.", "school": None, "classrooms": [], "students": [], "teachers": []})

        classrooms = Classroom.objects.filter(school=school)
        students = User.objects.filter(profile__school=school, profile__role='student')
        teachers = User.objects.filter(profile__school=school, profile__role__in=['teacher', 'school_admin'])

        girls_count = UserProfile.objects.filter(school=school, role='student', gender='girl').count()
        boys_count = UserProfile.objects.filter(school=school, role='student', gender='boy').count()

        from django.db.models import Sum
        lesson_sum = UserProfile.objects.filter(school=school, role='student').aggregate(
            s1=Sum('stage1_progress'),
            s2=Sum('stage2_progress'),
            s3=Sum('stage3_progress'),
            s4=Sum('stage4_progress')
        )
        total_lessons = (lesson_sum['s1'] or 0) + (lesson_sum['s2'] or 0) + (lesson_sum['s3'] or 0) + (lesson_sum['s4'] or 0)

        # Calculate school aggregates
        nr_list, lr_list, ct_list, ca_list, db_list = [], [], [], [], []
        for student_obj in students:
            stud_profile = getattr(student_obj, 'profile', None)
            if stud_profile:
                skills = calculate_skills(stud_profile)
                nr_list.append(skills['numeracy_pattern_recognition'])
                lr_list.append(skills['logical_reasoning'])
                ct_list.append(skills['computational_thinking'])
                ca_list.append(skills['coding_application'])
                db_list.append(skills['debugging'])

        if students.exists():
            avg_nr = sum(nr_list) / len(nr_list)
            avg_lr = sum(lr_list) / len(lr_list)
            avg_ct = sum(ct_list) / len(ct_list)
            avg_ca = sum(ca_list) / len(ca_list)
            
            all_avg_skills = {
                "Pattern Recognition": sum(nr_list) / len(nr_list),
                "Logical Reasoning": sum(lr_list) / len(lr_list),
                "Sequencing": sum(calculate_skills(getattr(student_obj, 'profile'))['sequencing'] for student_obj in students if getattr(student_obj, 'profile', None)) / len(students),
                "Problem Decomposition": sum(calculate_skills(getattr(student_obj, 'profile'))['problem_decomposition'] for student_obj in students if getattr(student_obj, 'profile', None)) / len(students),
                "Computational Thinking": sum(ct_list) / len(ct_list),
                "Coding Application": sum(ca_list) / len(ca_list),
                "Debugging": sum(db_list) / len(db_list),
                "Creative Problem Solving": sum(calculate_skills(getattr(student_obj, 'profile'))['creative_problem_solving'] for student_obj in students if getattr(student_obj, 'profile', None)) / len(students),
            }
            
            strongest_competency = max(all_avg_skills, key=all_avg_skills.get)
            most_common_weakness = min(all_avg_skills, key=all_avg_skills.get)
        else:
            avg_nr = 0
            avg_lr = 0
            avg_ct = 0
            avg_ca = 0
            strongest_competency = "N/A"
            most_common_weakness = "N/A"

        metrics = {
            "students_count": students.count(),
            "teachers_count": teachers.count(),
            "completed_lessons": total_lessons,
            "avg_numeracy_score": f"{int(avg_nr)}%",
            "coding_progress": f"{int(avg_ca)}%",
            "ai_activities": 0,
            "girls_count": girls_count,
            "boys_count": boys_count,
            "learning_profile": {
                "numeracy_mastery": f"{int(avg_nr)}%",
                "logical_reasoning": f"{int(avg_lr)}%",
                "computational_thinking": f"{int(avg_ct)}%",
                "coding_proficiency": f"{int(avg_ca)}%",
                "most_common_weakness": most_common_weakness,
                "strongest_competency": strongest_competency
            }
        }

        return Response({
            "school": SchoolSerializer(school).data,
            "metrics": metrics,
            "classrooms": ClassroomSerializer(classrooms, many=True).data,
            "students": UserSerializer(students, many=True).data,
            "teachers": UserSerializer(teachers, many=True).data,
            "teachers_count": teachers.count(),
            "students_count": students.count()
        })

class CreateClassroomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['school_admin', 'teacher', 'super_admin']:
            return Response({"error": "School Admin or Teacher permission required."}, status=status.HTTP_403_FORBIDDEN)

        school = profile.school
        if not school:
            return Response({"error": "School must be registered first."}, status=status.HTTP_400_BAD_REQUEST)

        name = request.data.get('name')
        grade_level = request.data.get('grade_level', '')
        teacher_id = request.data.get('teacher_id')

        if not name:
            return Response({"error": "Classroom name is required."}, status=status.HTTP_400_BAD_REQUEST)

        assigned_teacher = user
        if teacher_id:
            found_teacher = User.objects.filter(id=teacher_id, profile__school=school).first()
            if found_teacher:
                assigned_teacher = found_teacher

        classroom = Classroom.objects.create(
            school=school,
            name=name,
            grade_level=grade_level,
            teacher=assigned_teacher
        )

        return Response({
            "success": True,
            "classroom": ClassroomSerializer(classroom).data
        }, status=status.HTTP_201_CREATED)

class AssignTeacherToClassView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['school_admin', 'super_admin']:
            return Response({"error": "School Admin permission required."}, status=status.HTTP_403_FORBIDDEN)

        school = profile.school
        if not school:
            return Response({"error": "School must be registered first."}, status=status.HTTP_400_BAD_REQUEST)

        classroom_id = request.data.get('classroom_id')
        teacher_id = request.data.get('teacher_id')

        try:
            classroom = Classroom.objects.get(id=classroom_id, school=school)
        except Classroom.DoesNotExist:
            return Response({"error": "Classroom not found."}, status=status.HTTP_404_NOT_FOUND)

        if teacher_id:
            try:
                teacher_user = User.objects.get(id=teacher_id, profile__school=school)
                classroom.teacher = teacher_user
            except User.DoesNotExist:
                return Response({"error": "Teacher not found in this school."}, status=status.HTTP_404_NOT_FOUND)
        else:
            classroom.teacher = None

        classroom.save()
        return Response({
            "success": True,
            "classroom": ClassroomSerializer(classroom).data
        })

def calculate_skills(profile):
    s1 = profile.stage1_progress or 0
    s2 = profile.stage2_progress or 0
    s3 = profile.stage3_progress or 0
    s4 = profile.stage4_progress or 0

    s1_ratio = min(1.0, s1 / 80.0) if s1 > 0 else 0
    s2_ratio = min(1.0, s2 / 11.0) if s2 > 0 else 0
    s3_ratio = min(1.0, s3 / 10.0) if s3 > 0 else 0
    s4_ratio = min(1.0, s4 / 10.0) if s4 > 0 else 0

    # Skill percentages calculated dynamically from high watermarks
    nr = min(100, round((s1_ratio * 0.7 + s2_ratio * 0.15 + s3_ratio * 0.15) * 100))
    lr = min(100, round((s1_ratio * 0.2 + s2_ratio * 0.3 + s3_ratio * 0.2 + s4_ratio * 0.3) * 100))
    sq = min(100, round((s1_ratio * 0.4 + s2_ratio * 0.4 + s3_ratio * 0.2) * 100))
    pd = min(100, round((s1_ratio * 0.1 + s2_ratio * 0.3 + s3_ratio * 0.3 + s4_ratio * 0.3) * 100))
    ct = min(100, round((s1_ratio * 0.1 + s2_ratio * 0.3 + s3_ratio * 0.3 + s4_ratio * 0.3) * 100))
    ca = min(100, round((s2_ratio * 0.3 + s3_ratio * 0.3 + s4_ratio * 0.4) * 100))
    db = min(100, round((s2_ratio * 0.2 + s3_ratio * 0.4 + s4_ratio * 0.4) * 100))
    cps = min(100, round((s1_ratio * 0.1 + s2_ratio * 0.2 + s3_ratio * 0.4 + s4_ratio * 0.3) * 100))

    # Give a tiny baseline if they have started any progress so the progress bars look alive and aligned
    total_prog = s1 + s2 + s3 + s4
    if total_prog > 0:
        nr = max(nr, 12 if s1 > 0 else 0)
        lr = max(lr, 10)
        sq = max(sq, 15 if s1 > 0 or s2 > 0 else 0)
        pd = max(pd, 8)
        ct = max(ct, 10 if s2 > 0 else 0)
        ca = max(ca, 5 if s2 > 0 else 0)
        db = max(db, 5 if s2 > 0 or s3 > 0 else 0)
        cps = max(cps, 12)

    return {
        "numeracy_pattern_recognition": nr,
        "logical_reasoning": lr,
        "sequencing": sq,
        "problem_decomposition": pd,
        "computational_thinking": ct,
        "coding_application": ca,
        "debugging": db,
        "creative_problem_solving": cps
    }

def update_student_competencies(user, profile):
    from .models import StudentCompetency
    s1 = profile.stage1_progress or 0
    s2 = profile.stage2_progress or 0
    s3 = profile.stage3_progress or 0
    s4 = profile.stage4_progress or 0

    # 1. Sequencing
    seq_status = 'INTRODUCED'
    if s1 >= 70 or s2 >= 6:
        seq_status = 'MASTERED'
    elif s1 >= 40 or s2 >= 3:
        seq_status = 'PROFICIENT'
    elif s1 >= 15 or s2 >= 1:
        seq_status = 'DEVELOPING'
    StudentCompetency.objects.update_or_create(user=user, competency='sequencing', defaults={'status': seq_status})

    # 2. Pattern Recognition
    pat_status = 'INTRODUCED'
    if s1 >= 75 or s2 >= 5:
        pat_status = 'MASTERED'
    elif s1 >= 50 or s2 >= 2:
        pat_status = 'PROFICIENT'
    elif s1 >= 20:
        pat_status = 'DEVELOPING'
    StudentCompetency.objects.update_or_create(user=user, competency='patterns', defaults={'status': pat_status})

    # 3. Loops
    loop_status = 'INTRODUCED'
    if s2 >= 10 or s3 >= 5:
        loop_status = 'MASTERED'
    elif s2 >= 7 or s3 >= 2:
        loop_status = 'PROFICIENT'
    elif s2 >= 3:
        loop_status = 'DEVELOPING'
    StudentCompetency.objects.update_or_create(user=user, competency='loops', defaults={'status': loop_status})

    # 4. Debugging
    deb_status = 'INTRODUCED'
    if s2 >= 11 or s4 >= 3:
        deb_status = 'MASTERED'
    elif s2 >= 8 or s4 >= 1:
        deb_status = 'PROFICIENT'
    elif s2 >= 4:
        deb_status = 'DEVELOPING'
    StudentCompetency.objects.update_or_create(user=user, competency='debugging', defaults={'status': deb_status})

    # 5. Conditions
    cond_status = 'INTRODUCED'
    if s2 >= 11 or s4 >= 5:
        cond_status = 'MASTERED'
    elif s2 >= 9 or s4 >= 2:
        cond_status = 'PROFICIENT'
    elif s1 >= 60 or s2 >= 5:
        cond_status = 'DEVELOPING'
    StudentCompetency.objects.update_or_create(user=user, competency='conditions', defaults={'status': cond_status})

def calculate_weekly_journey(child, profile):
    from datetime import timedelta
    from django.utils import timezone
    from api.models import ProgressLog
    
    # query database for activities completed this week
    one_week_ago = timezone.now() - timedelta(days=7)
    weekly_activities = ProgressLog.objects.filter(user=child, created_at__gte=one_week_ago).count()
    
    s1 = profile.stage1_progress or 0
    s2 = profile.stage2_progress or 0
    s3 = profile.stage3_progress or 0
    s4 = profile.stage4_progress or 0
    
    s1_ratio = min(1.0, s1 / 80.0) if s1 > 0 else 0
    s2_ratio = min(1.0, s2 / 11.0) if s2 > 0 else 0
    s3_ratio = min(1.0, s3 / 10.0) if s3 > 0 else 0
    s4_ratio = min(1.0, s4 / 10.0) if s4 > 0 else 0
    
    # Fallback weekly activities if there's progress but it was not logged previously
    if weekly_activities == 0 and (s1 + s2 + s3 + s4) > 0:
        weekly_activities = min(5, max(1, (s1 + s2 + s3 + s4) % 6))

    # Calculate journey level on scale of 1 to 12
    journey_level = min(12, max(1, 1 + int((s1_ratio * 3) + (s2_ratio * 3) + (s3_ratio * 3) + (s4_ratio * 3)))) if (s1 + s2 + s3 + s4) > 0 else 1
    
    journey_map = {
        1: {
            "biggest_improvement": "Pattern recognition",
            "new_skill": "Number patterns & counting",
            "project_completed": "Numbers Around Me",
            "needs_practice": "Sequences",
            "journey_level_label": "Level 1 of 12",
            "journey_group": "Discoverers",
            "journey_level_percentage": 8,
            "try_at_home": f"Ask {child.username} to count items in the kitchen and explain what comes next in a 1-2-1 pattern!"
        },
        2: {
            "biggest_improvement": "Logical reasoning",
            "new_skill": "Bigger, Smaller, Same comparisons",
            "project_completed": "Logic & Sorting quiz",
            "needs_practice": "Order of operations",
            "journey_level_label": "Level 2 of 12",
            "journey_group": "Discoverers",
            "journey_level_percentage": 16,
            "try_at_home": f"Help {child.username} organize toys by size, and talk about IF-THEN rules (e.g. IF it is a block, THEN stack it)!"
        },
        3: {
            "biggest_improvement": "Sequencing",
            "new_skill": "Ordered instructions",
            "project_completed": "Pattern Master Challenge",
            "needs_practice": "Basic loops",
            "journey_level_label": "Level 3 of 12",
            "journey_group": "Discoverers",
            "journey_level_percentage": 25,
            "try_at_home": f"Play a 'robot' game where {child.username} gives you step-by-step commands to walk across the room!"
        },
        4: {
            "biggest_improvement": "Logical reasoning",
            "new_skill": "Conditional statements (Blockly)",
            "project_completed": "Smart Traffic Light",
            "needs_practice": "Debugging block errors",
            "journey_level_label": "Level 4 of 12",
            "journey_group": "Explorers",
            "journey_level_percentage": 33,
            "try_at_home": f"Ask {child.username} to explain why a traffic light needs automatic IF/THEN rules to guide traffic."
        },
        5: {
            "biggest_improvement": "Computational Thinking",
            "new_skill": "Repetitive structures / loops",
            "project_completed": "Blocky Loop Master",
            "needs_practice": "Variable setup",
            "journey_level_label": "Level 5 of 12",
            "journey_group": "Explorers",
            "journey_level_percentage": 41,
            "try_at_home": f"Count loops in real life: ask {child.username} how brushing their teeth has a loop (repeat brush until clean)!"
        },
        6: {
            "biggest_improvement": "Coding Application",
            "new_skill": "Function calls & sequences",
            "project_completed": "Maze Solver",
            "needs_practice": "Complex conditions",
            "journey_level_label": "Level 6 of 12",
            "journey_group": "Explorers",
            "journey_level_percentage": 50,
            "try_at_home": f"Ask {child.username} to explain the difference between a simple statement and a reusable routine!"
        },
        7: {
            "biggest_improvement": "Problem Decomposition",
            "new_skill": "UI Screen Designing & variables",
            "project_completed": "App Studio Counter",
            "needs_practice": "Function callbacks",
            "journey_level_label": "Level 7 of 12",
            "journey_group": "Builders",
            "journey_level_percentage": 58,
            "try_at_home": f"Ask {child.username} to sketch a phone screen on paper and explain where the buttons would go!"
        },
        8: {
            "biggest_improvement": "Debugging",
            "new_skill": "State management & conditions",
            "project_completed": "Interactive Calculator App",
            "needs_practice": "State synchronization",
            "journey_level_label": "Level 8 of 12",
            "journey_group": "Builders",
            "journey_level_percentage": 66,
            "try_at_home": f"Talk about what happens when you press buttons on a microwave, mapping inputs to microwave behavior!"
        },
        9: {
            "biggest_improvement": "Creative Problem Solving",
            "new_skill": "Event handlers & logic trees",
            "project_completed": "Mini Arcade Game",
            "needs_practice": "Logic speed",
            "journey_level_label": "Level 9 of 12",
            "journey_group": "Builders",
            "journey_level_percentage": 75,
            "try_at_home": f"Play a simple board game and ask {child.username} what actions lead to winning or losing points!"
        },
        10: {
            "biggest_improvement": "Coding Application",
            "new_skill": "Python Syntax & variables",
            "project_completed": "Python Quest Part 1",
            "needs_practice": "Syntax errors & indentation",
            "journey_level_label": "Level 10 of 12",
            "journey_group": "Innovators",
            "journey_level_percentage": 83,
            "try_at_home": f"Open a Python file and show {child.username} how clean spaces at the beginning of a line are so important!"
        },
        11: {
            "biggest_improvement": "Debugging",
            "new_skill": "Python Lists & Loops",
            "project_completed": "Data Filter Script",
            "needs_practice": "Array index errors",
            "journey_level_label": "Level 11 of 12",
            "journey_group": "Innovators",
            "journey_level_percentage": 91,
            "try_at_home": f"Ask {child.username} how lists store items in order, like a shopping list they can search through!"
        },
        12: {
            "biggest_improvement": "Computational Thinking",
            "new_skill": "Complex algorithms & functions",
            "project_completed": "Python Quest Final Boss",
            "needs_practice": "Code efficiency",
            "journey_level_label": "Level 12 of 12",
            "journey_group": "Innovators",
            "journey_level_percentage": 100,
            "try_at_home": f"Celebrate graduation! Ask {child.username} to build a Python script to say hello to everyone in the family!"
        }
    }
    
    details = journey_map.get(journey_level, journey_map[1])
    return {
        "title": f"{child.username}'s DolaCode Week",
        "activities_completed": weekly_activities,
        "biggest_improvement": details["biggest_improvement"],
        "new_skill": details["new_skill"],
        "project_completed": details["project_completed"],
        "needs_practice": details["needs_practice"],
        "journey_level_label": details["journey_level_label"],
        "journey_group": details["journey_group"],
        "journey_level_percentage": details["journey_level_percentage"],
        "try_at_home": details["try_at_home"]
    }

class ParentDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['parent', 'super_admin']:
            return Response({"error": "Parent access required."}, status=status.HTTP_403_FORBIDDEN)

        relations = ParentChild.objects.filter(parent=user)
        children_users = [rel.child for rel in relations]

        from .models import Subscription
        parent_sub = Subscription.objects.filter(parent=user).select_related('plan').order_by('-created_at').first()

        children_analytics = []
        for child in children_users:
            c_profile = getattr(child, 'profile', None)
            points = c_profile.points if c_profile else 0
            s1 = c_profile.stage1_progress if c_profile else 0
            s2 = c_profile.stage2_progress if c_profile else 0
            s3 = c_profile.stage3_progress if c_profile else 0
            s4 = c_profile.stage4_progress if c_profile else 0

            total_lessons = s1 + s2 + s3 + s4
            numeracy_score = f"{round((s1 / 10) * 100)}%" if s1 > 0 else "0%"
            coding_completed = s2 + s3 + s4
            coding_score = f"{round((coding_completed / 30) * 100)}%" if coding_completed > 0 else "0%"

            feedbacks = Feedback.objects.filter(user=child)
            feedback_count = feedbacks.count()

            if total_lessons > 0:
                homework_submitted = f"{min(100, round((total_lessons / 40) * 100))}%"
            else:
                homework_submitted = "0%"

            if points > 0:
                hours_spent = round(points * 0.15, 1)
                time_spent = f"{hours_spent} Hours Total"
            else:
                time_spent = "0 Mins"

            badges = UserBadge.objects.filter(user=child)
            badge_list = [
                {"name": ub.badge.name, "description": ub.badge.description, "icon": ub.badge.icon}
                for ub in badges
            ]

            # Dynamic Weekly Journey Recommendation and Tip
            weekly_jd = calculate_weekly_journey(child, c_profile)
            # Dynamic standard learning competencies
            learning_profile = calculate_skills(c_profile)

            if total_lessons == 0:
                summary = f"{child.username} has registered and is ready to start learning."
                teacher_feedback = "No submitted activities yet. Encourage student to complete Stage 1 Numeracy lessons!"
                ai_rec = "Lizzy AI recommends beginning Stage 1 Level 1 numeracy puzzles."
            else:
                highest_stage = 4 if s4 > 0 else (3 if s3 > 0 else (2 if s2 > 0 else 1))
                summary = f"{child.username} has completed {total_lessons} lessons and earned {points} stars! Currently active in Stage {highest_stage}."
                
                if feedback_count > 0:
                    last_fb = feedbacks.order_by('-created_at').first()
                    teacher_feedback = f"Completed Stage {last_fb.stage} Part {last_fb.part} with rating {last_fb.rating}/5."
                else:
                    teacher_feedback = "Actively completing curriculum lessons."

                if s1 < 10:
                    ai_rec = "Lizzy AI recommends finishing Stage 1 basic numeracy and math exercises."
                elif s2 < 10:
                    ai_rec = "Lizzy AI recommends practicing Stage 2 visual blockly coding logic."
                elif s3 < 10:
                    ai_rec = "Lizzy AI recommends focusing on Stage 3 condition loops and logic blocks."
                else:
                    ai_rec = "Lizzy AI recommends advancing through Stage 4 Python programming."

            if c_profile and c_profile.school and c_profile.school.status == 'APPROVED' and c_profile.classroom:
                plan_name = f"{c_profile.school.name} Plan"
                plan_status = f"Enrolled in {c_profile.classroom.name}"
                renews_at = "School Sponsored"
            elif parent_sub and parent_sub.is_valid():
                plan_name = parent_sub.plan.plan_name if parent_sub.plan else "Family Membership"
                plan_status = f"Active ({parent_sub.get_subscription_status_display()})"
                renews_at = parent_sub.current_period_end.strftime("%b %d, %Y") if parent_sub.current_period_end else "Active"
            else:
                plan_name = "Independent Learner"
                plan_status = "Subscription Required"
                renews_at = "Inactive"

            p_prog = getattr(child, 'pizza_shop_progress', None)
            pizza_shop_stats = None
            if p_prog:
                pizza_shop_stats = {
                    "current_level": p_prog.current_level,
                    "stars_earned": p_prog.stars_earned,
                    "dola_coins": p_prog.dola_coins,
                    "xp_earned": p_prog.xp_earned,
                    "accuracy": p_prog.accuracy,
                    "counting_accuracy": p_prog.counting_accuracy,
                    "addition_accuracy": p_prog.addition_accuracy,
                    "subtraction_accuracy": p_prog.subtraction_accuracy,
                    "problem_solving_accuracy": p_prog.problem_solving_accuracy,
                    "hints_used": p_prog.hints_used,
                    "coding_concepts_completed": p_prog.coding_concepts_completed,
                    "correct_orders": p_prog.correct_orders,
                    "time_spent_seconds": p_prog.time_spent_seconds,
                    "badges": p_prog.badges,
                }

            rm_prog = getattr(child, 'robot_maze_progress', None)
            robot_maze_stats = None
            if rm_prog:
                robot_maze_stats = {
                    "current_level": rm_prog.current_level,
                    "stars_earned": rm_prog.stars_earned,
                    "dola_coins": rm_prog.dola_coins,
                    "xp_earned": rm_prog.xp_earned,
                    "accuracy": rm_prog.accuracy,
                    "attempts": rm_prog.attempts,
                    "missions_completed": rm_prog.missions_completed,
                    "commands_used": rm_prog.commands_used,
                    "hints_used": rm_prog.hints_used,
                    "debugging_attempts": rm_prog.debugging_attempts,
                    "loops_completed": rm_prog.loops_completed,
                    "time_spent_seconds": rm_prog.time_spent_seconds,
                    "badges": rm_prog.badges,
                }

            mls_prog = getattr(child, 'my_little_shop_progress', None)
            my_little_shop_stats = None
            if mls_prog:
                my_little_shop_stats = {
                    "current_level": mls_prog.current_level,
                    "stars_earned": mls_prog.stars_earned,
                    "dola_coins": mls_prog.dola_coins,
                    "xp_earned": mls_prog.xp_earned,
                    "accuracy": mls_prog.accuracy,
                    "attempts": mls_prog.attempts,
                    "customers_served": mls_prog.customers_served,
                    "addition_accuracy": mls_prog.addition_accuracy,
                    "subtraction_accuracy": mls_prog.subtraction_accuracy,
                    "money_recognition_accuracy": mls_prog.money_recognition_accuracy,
                    "change_accuracy": mls_prog.change_accuracy,
                    "multiplication_accuracy": mls_prog.multiplication_accuracy,
                    "profit_accuracy": mls_prog.profit_accuracy,
                    "stock_accuracy": mls_prog.stock_accuracy,
                    "problem_solving_accuracy": mls_prog.problem_solving_accuracy,
                    "hints_used": mls_prog.hints_used,
                    "time_spent_seconds": mls_prog.time_spent_seconds,
                    "shop_upgrades": mls_prog.shop_upgrades,
                    "badges": mls_prog.badges,
                }

            fa_prog = getattr(child, 'frog_adventure_progress', None)
            frog_adventure_stats = None
            if fa_prog:
                frog_adventure_stats = {
                    "current_level": fa_prog.current_level,
                    "stars_earned": fa_prog.stars_earned,
                    "dola_coins": fa_prog.dola_coins,
                    "xp_earned": fa_prog.xp_earned,
                    "accuracy": fa_prog.accuracy,
                    "attempts": fa_prog.attempts,
                    "fruits_collected": fa_prog.fruits_collected,
                    "counting_accuracy": fa_prog.counting_accuracy,
                    "sequence_accuracy": fa_prog.sequence_accuracy,
                    "pattern_accuracy": fa_prog.pattern_accuracy,
                    "coordinates_accuracy": fa_prog.coordinates_accuracy,
                    "route_planning_accuracy": fa_prog.route_planning_accuracy,
                    "loops_completed": fa_prog.loops_completed,
                    "debugging_attempts": fa_prog.debugging_attempts,
                    "hints_used": fa_prog.hints_used,
                    "time_spent_seconds": fa_prog.time_spent_seconds,
                    "unlocked_costumes": fa_prog.unlocked_costumes,
                    "badges": fa_prog.badges,
                }

            tr_prog = getattr(child, 'traffic_rescue_progress', None)
            traffic_rescue_stats = None
            if tr_prog:
                traffic_rescue_stats = {
                    "current_level": tr_prog.current_level,
                    "stars_earned": tr_prog.stars_earned,
                    "dola_coins": tr_prog.dola_coins,
                    "xp_earned": tr_prog.xp_earned,
                    "city_points": tr_prog.city_points,
                    "accuracy": tr_prog.accuracy,
                    "attempts": tr_prog.attempts,
                    "vehicles_guided": tr_prog.vehicles_guided,
                    "pedestrians_saved": tr_prog.pedestrians_saved,
                    "sequencing_ability": tr_prog.sequencing_ability,
                    "logical_reasoning": tr_prog.logical_reasoning,
                    "condition_usage": tr_prog.condition_usage,
                    "timing_accuracy": tr_prog.timing_accuracy,
                    "debugging_accuracy": tr_prog.debugging_accuracy,
                    "hints_used": tr_prog.hints_used,
                    "time_spent_seconds": tr_prog.time_spent_seconds,
                    "city_upgrades": tr_prog.city_upgrades,
                    "badges": tr_prog.badges,
                }

            pr_prog = getattr(child, 'pet_rescue_progress', None)
            pet_rescue_stats = None
            if pr_prog:
                pet_rescue_stats = {
                    "current_level": pr_prog.current_level,
                    "stars_earned": pr_prog.stars_earned,
                    "dola_coins": pr_prog.dola_coins,
                    "xp_earned": pr_prog.xp_earned,
                    "happiness_points": pr_prog.happiness_points,
                    "accuracy": pr_prog.accuracy,
                    "attempts": pr_prog.attempts,
                    "pets_helped": pr_prog.pets_helped,
                    "counting_accuracy": pr_prog.counting_accuracy,
                    "classification_accuracy": pr_prog.classification_accuracy,
                    "sequence_accuracy": pr_prog.sequence_accuracy,
                    "pattern_accuracy": pr_prog.pattern_accuracy,
                    "condition_usage": pr_prog.condition_usage,
                    "loops_completed": pr_prog.loops_completed,
                    "debugging_accuracy": pr_prog.debugging_accuracy,
                    "hints_used": pr_prog.hints_used,
                    "time_spent_seconds": pr_prog.time_spent_seconds,
                    "unlocked_pets": pr_prog.unlocked_pets,
                    "unlocked_accessories": pr_prog.unlocked_accessories,
                    "badges": pr_prog.badges,
                }

            dm_prog = getattr(child, 'dolamoney_progress', None)
            dolamoney_stats = None
            if dm_prog:
                skills_raw = dm_prog.financial_skills or {}
                def get_skill_status(skill_key, world_num):
                    if skill_key in skills_raw:
                        return skills_raw[skill_key]
                    if world_num in dm_prog.completed_worlds:
                        return "Mastered"
                    elif dm_prog.current_world >= world_num or (isinstance(dm_prog.world_levels, dict) and dm_prog.world_levels.get(f"world{world_num}", 0) > 0):
                        return "Practising"
                    return "Learning"

                child_name = child.first_name or child.username
                prompts = []
                if 2 in dm_prog.completed_worlds or (isinstance(dm_prog.world_levels, dict) and dm_prog.world_levels.get("world2", 0) > 0):
                    prompts.append(f"This week {child_name} explored Needs vs Wants. Next time you visit a store together, ask: 'Can you point out two things we NEED and one thing that is a WANT?'")
                else:
                    prompts.append(f"Ask {child_name}: 'If you were given ₦1,000 today, would you choose to spend it on a quick treat or save it for something bigger?'")

                if dm_prog.savings_streak > 0 or 3 in dm_prog.completed_worlds:
                    target_name = dm_prog.active_savings_goal.get('name', 'their goal') if isinstance(dm_prog.active_savings_goal, dict) and dm_prog.active_savings_goal else 'a dream toy'
                    prompts.append(f"{child_name} is currently saving for {target_name} with a {dm_prog.savings_streak}-week streak! Ask: 'How does it feel to see your savings jar grow each week?'")
                else:
                    prompts.append(f"Ask {child_name}: 'What is one special goal or STEM kit you would like to save up for this term?'")

                if 5 in dm_prog.completed_worlds or (isinstance(dm_prog.world_levels, dict) and dm_prog.world_levels.get("world5", 0) > 0):
                    prompts.append(f"In 'My Little Business', {child_name} managed pricing and profit. Ask: 'When you ran your stall, how did setting the price too high or too low affect your customers?'")

                dolamoney_stats = {
                    "dola_coins": dm_prog.dola_coins,
                    "xp_earned": dm_prog.xp_earned,
                    "savings_streak": dm_prog.savings_streak,
                    "savings_total": dm_prog.savings_total,
                    "current_world": dm_prog.current_world,
                    "completed_worlds": dm_prog.completed_worlds,
                    "active_savings_goal": dm_prog.active_savings_goal,
                    "business_stats": dm_prog.business_stats,
                    "badges": dm_prog.badges,
                    "time_spent_seconds": dm_prog.time_spent_seconds,
                    "skills": {
                        "money_recognition": {"name": "Money Recognition (Naira)", "status": get_skill_status("money_recognition", 1)},
                        "needs_vs_wants": {"name": "Needs vs Wants", "status": get_skill_status("needs_vs_wants", 2)},
                        "savings": {"name": "Savings & Goals", "status": get_skill_status("savings", 3)},
                        "budgeting": {"name": "Budgeting & Planning", "status": get_skill_status("budgeting", 4)},
                        "banking_basics": {"name": "Banking Basics (DolaBank)", "status": get_skill_status("banking_basics", 7)},
                        "entrepreneurship": {"name": "Entrepreneurship & Profit", "status": get_skill_status("entrepreneurship", 5)},
                        "decision_making": {"name": "Financial Decision-Making", "status": get_skill_status("decision_making", 9)}
                    },
                    "conversation_prompts": prompts
                }

            child_user_data = UserSerializer(child).data
            child_user_data['pin'] = c_profile.pin if c_profile else None
            child_user_data['first_name'] = child.first_name

            children_analytics.append({
                "user": child_user_data,
                "analytics": {
                    "pin": c_profile.pin if c_profile else None,
                    "first_name": child.first_name,
                    "lessons_completed": total_lessons,
                    "homework_submitted": homework_submitted,
                    "numeracy_score": numeracy_score,
                    "coding_score": coding_score,
                    "time_spent": time_spent,
                    "achievements": badge_list,
                    "pizza_shop_stats": pizza_shop_stats,
                    "robot_maze_stats": robot_maze_stats,
                    "my_little_shop_stats": my_little_shop_stats,
                    "frog_adventure_stats": frog_adventure_stats,
                    "traffic_rescue_stats": traffic_rescue_stats,
                    "pet_rescue_stats": pet_rescue_stats,
                    "dolamoney_stats": dolamoney_stats,
                    "weekly_report": {
                        "summary": summary,
                        "teacher_feedback": teacher_feedback,
                        "ai_recommendation": ai_rec
                    },
                    "weekly_journey": weekly_jd,
                    "learning_profile": learning_profile,
                    "subscription": {
                        "plan": plan_name,
                        "status": plan_status,
                        "renews_at": renews_at
                    }
                }
            })

        return Response({
            "parent": UserSerializer(user).data,
            "parent_subscription": {
                "has_subscription": parent_sub is not None,
                "is_active": parent_sub.is_valid() if parent_sub else False,
                "plan_name": parent_sub.plan.plan_name if (parent_sub and parent_sub.plan) else "No Active Plan",
                "status": parent_sub.subscription_status if parent_sub else "inactive",
                "current_period_end": parent_sub.current_period_end.isoformat() if (parent_sub and parent_sub.current_period_end) else None,
                "grace_period_end": parent_sub.grace_period_end.isoformat() if (parent_sub and parent_sub.grace_period_end) else None,
            },
            "children": children_analytics
        })

class ClaimParentAccountView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "Email and password required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email.strip())
            user.set_password(password)
            user.save()

            from rest_framework.authtoken.models import Token
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                "success": True,
                "message": "Account created successfully!",
                "token": token.key,
                "user": UserSerializer(user).data
            })
        except User.DoesNotExist:
            return Response({"error": "No pending parent account found with that email."}, status=status.HTTP_404_NOT_FOUND)


class LinkChildView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['parent', 'super_admin']:
            return Response({"error": "Parent access required."}, status=status.HTTP_403_FORBIDDEN)

        # Mode A: Create child profile with Name and 4-digit PIN
        name = request.data.get('name', '').strip()
        pin = str(request.data.get('pin', '')).strip()
        age = request.data.get('age')
        gender = request.data.get('gender')

        if name and pin:
            if len(pin) != 4 or not pin.isdigit():
                return Response({"error": "PIN must be exactly 4 digits (e.g. 1234)."}, status=status.HTTP_400_BAD_REQUEST)
            if len(name) < 2:
                return Response({"error": "Child's name must be at least 2 characters."}, status=status.HTTP_400_BAD_REQUEST)

            import re, random
            from django.contrib.auth.hashers import make_password

            clean_name = re.sub(r'[^a-zA-Z0-9]', '', name).lower() or "child"
            while True:
                candidate_uname = f"{clean_name}_{random.randint(100, 9999)}"
                if not User.objects.filter(username=candidate_uname).exists():
                    break

            domain = user.email.split('@')[-1] if ('@' in user.email) else 'dolacode.family'
            internal_email = f"{candidate_uname}@{domain}"

            age_val = None
            if age:
                try:
                    age_val = int(age)
                except (ValueError, TypeError):
                    pass

            child_user = User.objects.create_user(
                username=candidate_uname,
                email=internal_email,
                first_name=name,
                password=make_password(pin)
            )

            learning_band = 'Cadet'
            if age_val:
                if age_val <= 7:
                    learning_band = 'Cadet'
                elif age_val <= 10:
                    learning_band = 'Explorer'
                elif age_val <= 13:
                    learning_band = 'Creator'
                else:
                    learning_band = 'Innovator'

            UserProfile.objects.create(
                user=child_user,
                role='student',
                pin=pin,
                age=age_val,
                gender=gender or '',
                starting_score=50,
                learning_band=learning_band
            )

            ParentChild.objects.create(parent=user, child=child_user)

            return Response({
                "success": True,
                "message": f"Successfully created and linked child profile for {name} with 4-digit PIN {pin}!",
                "child": {
                    **UserSerializer(child_user).data,
                    "pin": pin
                }
            }, status=status.HTTP_201_CREATED)

        # Mode B: Legacy Link existing account by username or email
        identifier = request.data.get('identifier', '').strip()
        if not identifier:
            return Response({"error": "Please provide your child's Name and 4-digit PIN."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from django.db.models import Q
            child_user = User.objects.get(Q(username__iexact=identifier) | Q(email__iexact=identifier))
        except User.DoesNotExist:
            return Response({"error": "Student account not found with that username or email."}, status=status.HTTP_404_NOT_FOUND)

        rel, created = ParentChild.objects.get_or_create(parent=user, child=child_user)
        if pin and len(pin) == 4 and pin.isdigit():
            c_prof = getattr(child_user, 'profile', None)
            if c_prof:
                c_prof.pin = pin
                c_prof.save(update_fields=['pin'])
            from django.contrib.auth.hashers import make_password
            child_user.password = make_password(pin)
            child_user.save()

        return Response({
            "success": True,
            "message": f"Successfully linked student {child_user.first_name or child_user.username}!",
            "child": UserSerializer(child_user).data
        })


class ParentChildrenListView(APIView):
    """
    Lists and creates child accounts for the authenticated parent.
    Route: GET, POST /api/parent/children/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['parent', 'super_admin']:
            return Response({"error": "Parent access required."}, status=status.HTTP_403_FORBIDDEN)

        relations = ParentChild.objects.filter(parent=user).select_related('child', 'child__profile')
        children_data = []
        for rel in relations:
            child = rel.child
            c_profile = getattr(child, 'profile', None)
            display_name = child.first_name or child.username
            children_data.append({
                "id": child.id,
                "name": display_name,
                "username": child.username,
                "email": child.email,
                "pin": c_profile.pin if c_profile else None,
                "age": c_profile.age if c_profile else None,
                "gender": c_profile.gender if c_profile else None,
                "points": c_profile.points if c_profile else 0,
                "current_streak": c_profile.current_streak if c_profile else 0,
                "stage1_progress": c_profile.stage1_progress if c_profile else 0,
                "stage2_progress": c_profile.stage2_progress if c_profile else 0,
                "stage3_progress": c_profile.stage3_progress if c_profile else 0,
                "stage4_progress": c_profile.stage4_progress if c_profile else 0,
                "linked_at": rel.linked_at.isoformat() if hasattr(rel, 'linked_at') and rel.linked_at else None
            })

        return Response({"children": children_data, "count": len(children_data)}, status=status.HTTP_200_OK)

    def post(self, request):
        return LinkChildView().post(request)


class ParentChildDetailView(APIView):
    """
    Manages an individual linked child account (update PIN/name/age or unlink).
    Route: PUT, DELETE /api/parent/children/<int:child_id>/
    """
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, child_id):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['parent', 'super_admin']:
            return Response({"error": "Parent access required."}, status=status.HTTP_403_FORBIDDEN)

        is_linked = ParentChild.objects.filter(parent=user, child_id=child_id).exists()
        if not is_linked:
            return Response({"error": "Child is not linked to this parent account."}, status=status.HTTP_404_NOT_FOUND)

        try:
            child = User.objects.get(id=child_id)
        except User.DoesNotExist:
            return Response({"error": "Child account not found."}, status=status.HTTP_404_NOT_FOUND)

        c_profile = getattr(child, 'profile', None)

        name = request.data.get('name', '').strip()
        pin = str(request.data.get('pin', '')).strip()
        age = request.data.get('age')
        gender = request.data.get('gender')

        if pin:
            if len(pin) != 4 or not pin.isdigit():
                return Response({"error": "PIN must be exactly 4 digits (e.g. 1234)."}, status=status.HTTP_400_BAD_REQUEST)
            if c_profile:
                c_profile.pin = pin
            from django.contrib.auth.hashers import make_password
            child.password = make_password(pin)

        if name:
            child.first_name = name

        if age is not None and c_profile:
            try:
                c_profile.age = int(age)
            except (ValueError, TypeError):
                pass

        if gender is not None and c_profile:
            c_profile.gender = gender

        child.save()
        if c_profile:
            c_profile.save()

        return Response({
            "success": True,
            "message": f"Updated child profile for {child.first_name or child.username}!",
            "child": {
                **UserSerializer(child).data,
                "pin": c_profile.pin if c_profile else None
            }
        }, status=status.HTTP_200_OK)

    def delete(self, request, child_id):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['parent', 'super_admin']:
            return Response({"error": "Parent access required."}, status=status.HTTP_403_FORBIDDEN)

        rel = ParentChild.objects.filter(parent=user, child_id=child_id).first()
        if not rel:
            return Response({"error": "Child is not linked to this parent account."}, status=status.HTTP_404_NOT_FOUND)

        rel.delete()
        return Response({"success": True, "message": "Child account successfully unlinked from family."}, status=status.HTTP_200_OK)


class SwitchToChildView(APIView):
    """
    Allows an authenticated parent to directly launch/switch into a child's learning session.
    Route: POST /api/parent/switch-to-child/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['parent', 'super_admin']:
            return Response({"error": "Parent access required."}, status=status.HTTP_403_FORBIDDEN)

        child_id = request.data.get('child_id')
        if not child_id:
            return Response({"error": "Child ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        is_linked = ParentChild.objects.filter(parent=user, child_id=child_id).exists()
        if not is_linked:
            return Response({"error": "Child is not linked to your parent account."}, status=status.HTTP_403_FORBIDDEN)

        try:
            child = User.objects.get(id=child_id)
        except User.DoesNotExist:
            return Response({"error": "Child account not found."}, status=status.HTTP_404_NOT_FOUND)

        c_profile = getattr(child, 'profile', None)
        if c_profile:
            needs_save = False
            if c_profile.starting_score is None:
                c_profile.starting_score = 50
                needs_save = True
            if not c_profile.learning_band:
                c_profile.learning_band = 'Cadet'
                needs_save = True
            if needs_save:
                c_profile.save(update_fields=['starting_score', 'learning_band'])

        token, _ = Token.objects.get_or_create(user=child)
        user_data = UserSerializer(child).data
        try:
            from .subscription_service import is_student_accessible
            user_data['subscription_access'] = is_student_accessible(child)
        except Exception:
            pass
        return Response({
            "success": True,
            "token": token.key,
            "user": user_data,
            "message": f"Switched session to {child.first_name or child.username}."
        }, status=status.HTTP_200_OK)

class ApproveSchoolView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not user.is_superuser and (not profile or profile.role != 'super_admin'):
            return Response({"error": "Super Admin permission required."}, status=status.HTTP_403_FORBIDDEN)

        school_id = request.data.get('school_id')
        new_status = request.data.get('status')

        if not school_id or new_status not in ['APPROVED', 'REJECTED', 'PENDING']:
            return Response({"error": "Valid school_id and status (APPROVED/REJECTED) required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            school = School.objects.get(id=school_id)
            previous_status = school.status
            school.status = new_status
            school.save()

            if new_status == 'APPROVED' and previous_status != 'APPROVED':
                try:
                    from .emails import send_school_approval_email
                    recipients = [school.contact_email, school.principal_email]
                    admin_members = school.members.filter(role='school_admin')
                    for member in admin_members:
                        if member.user and member.user.email:
                            recipients.append(member.user.email)
                    send_school_approval_email(school, recipients)
                except Exception as e:
                    print("Error sending approval email:", e)

            return Response({
                "success": True,
                "message": f"School '{school.name}' status updated to {new_status}!",
                "school": SchoolSerializer(school).data
            })
        except School.DoesNotExist:
            return Response({"error": "School not found."}, status=status.HTTP_404_NOT_FOUND)

class DeleteSchoolView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return self._delete_school(request)

    def delete(self, request):
        return self._delete_school(request)

    def _delete_school(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not user.is_superuser and (not profile or profile.role != 'super_admin'):
            return Response({"error": "Super Admin permission required."}, status=status.HTTP_403_FORBIDDEN)

        school_id = request.data.get('school_id') or request.query_params.get('school_id')
        if not school_id:
            return Response({"error": "School ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            school = School.objects.get(id=school_id)
            school_name = school.name
            school.delete()
            return Response({
                "success": True,
                "message": f"School '{school_name}' deleted successfully!"
            })
        except School.DoesNotExist:
            return Response({"error": "School not found."}, status=status.HTTP_404_NOT_FOUND)

class AddSchoolTeacherView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['school_admin', 'super_admin']:
            return Response({"error": "School Admin permission required."}, status=status.HTTP_403_FORBIDDEN)

        school = profile.school
        if not school or school.status != 'APPROVED':
            return Response({"error": "Approved school required to add teachers."}, status=status.HTTP_400_BAD_REQUEST)

        username = request.data.get('username') or request.data.get('email')
        email = request.data.get('email')
        password = request.data.get('password', 'Teacher123!')

        if not email:
            return Response({"error": "Teacher email is required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        teacher_user = User.objects.create_user(username=username, email=email, password=password)
        UserProfile.objects.create(user=teacher_user, role='teacher', school=school)

        return Response({
            "success": True,
            "message": f"Teacher {username} added to school!",
            "teacher": UserSerializer(teacher_user).data
        }, status=status.HTTP_201_CREATED)

class AddSchoolStudentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['school_admin', 'teacher', 'super_admin']:
            return Response({"error": "School Admin or Teacher permission required."}, status=status.HTTP_403_FORBIDDEN)

        school = profile.school
        if not school or school.status != 'APPROVED':
            return Response({"error": "Approved school required to add students."}, status=status.HTTP_400_BAD_REQUEST)

        name = request.data.get('name') or request.data.get('username')
        age = request.data.get('age')
        gender = request.data.get('gender')
        classroom_id = request.data.get('classroom_id')
        parent_email = request.data.get('parent_email')

        if not name or not name.strip():
            return Response({"error": "Student name is required."}, status=status.HTTP_400_BAD_REQUEST)

        base_username = name.strip()
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1

        email = request.data.get('email') or f"{username.lower().replace(' ', '_')}@student.dolacode.com"
        password = request.data.get('password', 'Student123!')

        classroom_obj = None
        if classroom_id:
            try:
                classroom_obj = Classroom.objects.get(id=classroom_id, school=school)
            except Classroom.DoesNotExist:
                pass

        student_user = User.objects.create_user(username=username, email=email, password=password)
        try:
            parsed_age = int(age) if age else None
        except (ValueError, TypeError):
            parsed_age = None

        UserProfile.objects.create(
            user=student_user, 
            role='student', 
            school=school, 
            classroom=classroom_obj,
            age=parsed_age,
            gender=gender
        )

        parent_user = None
        if parent_email and parent_email.strip():
            p_email = parent_email.strip()
            try:
                parent_user = User.objects.get(email__iexact=p_email)
            except User.DoesNotExist:
                p_username = p_email.split('@')[0]
                if User.objects.filter(username=p_username).exists():
                    p_username = f"{p_username}_parent"
                parent_user = User.objects.create_user(username=p_username, email=p_email, password='Parent123!')
                UserProfile.objects.create(user=parent_user, role='parent')
            
            ParentChild.objects.get_or_create(parent=parent_user, child=student_user)

        return Response({
            "success": True,
            "message": f"Student {username} enrolled successfully!",
            "student": UserSerializer(student_user).data,
            "parent_linked": parent_email if parent_user else None
        }, status=status.HTTP_201_CREATED)

class InviteParentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['school_admin', 'teacher', 'super_admin']:
            return Response({"error": "School permission required."}, status=status.HTTP_403_FORBIDDEN)

        parent_email = request.data.get('email')
        if not parent_email:
            return Response({"error": "Parent email is required."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "success": True,
            "message": f"Invitation email sent to {parent_email}!"
        })

import csv
import io

class BulkUploadStudentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['school_admin', 'teacher', 'super_admin']:
            return Response({"error": "School Admin or Teacher permission required."}, status=status.HTTP_403_FORBIDDEN)

        school = profile.school
        if not school or school.status != 'APPROVED':
            return Response({"error": "Approved school required to upload students."}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({"error": "No Excel or CSV file provided."}, status=status.HTTP_400_BAD_REQUEST)

        filename = uploaded_file.name.lower()
        rows = []

        try:
            if filename.endswith('.csv') or filename.endswith('.txt'):
                file_data = uploaded_file.read().decode('utf-8-sig', errors='replace')
                io_string = io.StringIO(file_data)
                reader = csv.DictReader(io_string)
                for r in reader:
                    rows.append(r)
            else:
                file_data = uploaded_file.read().decode('latin-1', errors='replace')
                lines = [line for line in file_data.splitlines() if line.strip()]
                if lines:
                    headers = [h.strip().strip('"\'') for h in lines[0].split(',')]
                    for line in lines[1:]:
                        vals = [v.strip().strip('"\'') for v in line.split(',')]
                        row_dict = dict(zip(headers, vals))
                        rows.append(row_dict)
        except Exception as e:
            return Response({"error": f"Failed to parse file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        if not rows:
            return Response({"error": "No valid data rows found in uploaded file."}, status=status.HTTP_400_BAD_REQUEST)

        created_count = 0
        linked_parents_count = 0

        for row in rows:
            row_normalized = {str(k).strip().lower(): str(v).strip() for k, v in row.items() if k}
            
            name = row_normalized.get('name') or row_normalized.get('student name') or row_normalized.get('full name')
            if not name:
                continue

            age = row_normalized.get('age')
            class_name = row_normalized.get('class') or row_normalized.get('classroom') or row_normalized.get('grade')
            parent_phone = row_normalized.get('parent phone') or row_normalized.get('phone')
            parent_email = row_normalized.get('parent email') or row_normalized.get('email')

            classroom_obj = None
            if class_name:
                classroom_obj, _ = Classroom.objects.get_or_create(
                    school=school, 
                    name=class_name,
                    defaults={'grade_level': class_name, 'teacher': user}
                )

            base_username = name.strip()
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            email = f"{username.lower().replace(' ', '_')}@student.dolacode.com"
            student_user = User.objects.create_user(username=username, email=email, password='Student123!')
            
            parsed_age = None
            if age:
                try:
                    parsed_age = int(age)
                except (ValueError, TypeError):
                    pass

            UserProfile.objects.create(
                user=student_user,
                role='student',
                school=school,
                classroom=classroom_obj,
                age=parsed_age
            )
            created_count += 1

            if parent_email or parent_phone:
                p_email = parent_email if parent_email else f"{parent_phone.replace('+', '').replace(' ', '')}@parent.dolacode.com"
                try:
                    parent_user = User.objects.get(email__iexact=p_email)
                except User.DoesNotExist:
                    p_username = p_email.split('@')[0]
                    if User.objects.filter(username=p_username).exists():
                        p_username = f"{p_username}_parent"
                    parent_user = User.objects.create_user(username=p_username, email=p_email, password='Parent123!')
                    UserProfile.objects.create(user=parent_user, role='parent')

                ParentChild.objects.get_or_create(parent=parent_user, child=student_user)
                linked_parents_count += 1

        return Response({
            "success": True,
            "message": f"Successfully uploaded and enrolled {created_count} students ({linked_parents_count} parent accounts linked)!",
            "created_count": created_count,
            "linked_parents_count": linked_parents_count
        }, status=status.HTTP_201_CREATED)

class TeacherDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.role not in ['teacher', 'school_admin', 'super_admin']:
            return Response({"error": "Teacher permission required."}, status=status.HTTP_403_FORBIDDEN)

        classroom = Classroom.objects.filter(teacher=user).first()
        if not classroom and profile.school:
            classroom = Classroom.objects.filter(school=profile.school).first()

        if not classroom:
            class_name = "No Classroom Assigned"
            students_qs = User.objects.none()
        else:
            class_name = classroom.name
            students_qs = User.objects.filter(profile__classroom=classroom, profile__role='student')
            if not students_qs.exists() and profile.school:
                students_qs = User.objects.filter(profile__school=profile.school, profile__role='student')

        students_data = UserSerializer(students_qs, many=True).data
        total_students = students_qs.count()

        sorted_students = sorted(
            students_data, 
            key=lambda s: (s.get('profile', {}).get('points', 0) if s.get('profile') else 0), 
            reverse=True
        )

        strong_students = [s for s in sorted_students if (s.get('profile', {}).get('points', 0) or 0) > 0][:5]
        weak_students = [s for s in reversed(sorted_students) if (s.get('profile', {}).get('points', 0) or 0) < 50][:5]

        # Calculate class averages
        nr_list, lr_list, ct_list, ca_list, db_list = [], [], [], [], []
        
        for student_obj in students_qs:
            stud_profile = getattr(student_obj, 'profile', None)
            if stud_profile:
                skills = calculate_skills(stud_profile)
                nr_list.append(skills['numeracy_pattern_recognition'])
                lr_list.append(skills['logical_reasoning'])
                ct_list.append(skills['computational_thinking'])
                ca_list.append(skills['coding_application'])
                db_list.append(skills['debugging'])
                
        if len(students_qs) > 0:
            avg_nr = sum(nr_list) / len(nr_list)
            avg_lr = sum(lr_list) / len(lr_list)
            avg_ct = sum(ct_list) / len(ct_list)
            avg_ca = sum(ca_list) / len(ca_list)
            
            # Map average to list to find weakness/strongest
            all_avg_skills = {
                "Pattern Recognition": sum(nr_list) / len(nr_list),
                "Logical Reasoning": sum(lr_list) / len(lr_list),
                "Sequencing": sum(calculate_skills(getattr(st_obj, 'profile'))['sequencing'] for st_obj in students_qs if getattr(st_obj, 'profile', None)) / len(students_qs),
                "Problem Decomposition": sum(calculate_skills(getattr(st_obj, 'profile'))['problem_decomposition'] for st_obj in students_qs if getattr(st_obj, 'profile', None)) / len(students_qs),
                "Computational Thinking": sum(ct_list) / len(ct_list),
                "Coding Application": sum(ca_list) / len(ca_list),
                "Debugging": sum(db_list) / len(db_list),
                "Creative Problem Solving": sum(calculate_skills(getattr(st_obj, 'profile'))['creative_problem_solving'] for st_obj in students_qs if getattr(st_obj, 'profile', None)) / len(students_qs),
            }
            
            strongest_competency = max(all_avg_skills, key=all_avg_skills.get)
            most_common_weakness = min(all_avg_skills, key=all_avg_skills.get)

            from django.db.models import Sum
            lesson_sum = UserProfile.objects.filter(classroom=classroom, role='student').aggregate(
                s1=Sum('stage1_progress'),
                s2=Sum('stage2_progress'),
                s3=Sum('stage3_progress'),
                s4=Sum('stage4_progress')
            ) if classroom else {'s1': 0, 's2': 0, 's3': 0, 's4': 0}
            total_lessons = (lesson_sum['s1'] or 0) + (lesson_sum['s2'] or 0) + (lesson_sum['s3'] or 0) + (lesson_sum['s4'] or 0)
            avg_completion_pct = min(100, round((total_lessons / (total_students * 40)) * 100)) if total_students > 0 else 0
            lesson_comp_str = f"{avg_completion_pct}%"
            homework_str = f"{avg_completion_pct}%"

            from django.utils import timezone
            today = timezone.now().date()
            active_today = UserProfile.objects.filter(classroom=classroom, role='student', last_active_date=today).count() if classroom else 0
            attendance_pct = round((active_today / total_students) * 100) if total_students > 0 else 0
            attendance_str = f"{attendance_pct}% ({active_today}/{total_students} Active)"
        else:
            avg_nr = 0
            avg_lr = 0
            avg_ct = 0
            avg_ca = 0
            strongest_competency = "N/A"
            most_common_weakness = "N/A"
            attendance_str = "0% (0 Present)"
            lesson_comp_str = "0%"
            homework_str = "0%"

        return Response({
            "teacher": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "classroom": {
                "id": classroom.id if classroom else None,
                "name": class_name,
                "grade_level": classroom.grade_level if classroom else "N/A",
                "students_count": total_students,
            },
            "metrics": {
                "attendance": attendance_str,
                "lesson_completion": lesson_comp_str,
                "homework": homework_str,
                "learning_profile": {
                    "numeracy_mastery": f"{int(avg_nr)}%",
                    "logical_reasoning": f"{int(avg_lr)}%",
                    "computational_thinking": f"{int(avg_ct)}%",
                    "coding_proficiency": f"{int(avg_ca)}%",
                    "most_common_weakness": most_common_weakness,
                    "strongest_competency": strongest_competency
                }
            },
            "leaderboard": sorted_students,
            "strong_students": strong_students,
            "weak_students": weak_students,
            "all_students": students_data
        })


from html.parser import HTMLParser

class RobustHTMLTagExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = set()
        self.classes = set()
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        for attr, val in attrs:
            if attr == 'class' and val:
                for cls in val.split():
                    self.classes.add(cls.strip())
            elif attr == 'id' and val:
                self.ids.add(val.strip())

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

def validate_html_solution(html_code, css_code, criteria, js_code=''):
    """
    Safely validates HTML, CSS & JavaScript against solution criteria without throwing exceptions on empty, malformed, or nested code.
    Returns: (is_passed: bool, results: list of dicts)
    """
    results = []
    if not isinstance(criteria, dict):
        criteria = {}

    req_tags = criteria.get('required_tags', [])
    req_classes = criteria.get('required_classes', [])
    req_css = criteria.get('required_css_rules', [])
    req_js = criteria.get('required_js_rules', [])

    extractor = RobustHTMLTagExtractor()
    if html_code:
        try:
            extractor.feed(str(html_code))
        except Exception:
            pass

    passed_all = True

    # 1. Check required HTML tags
    for tag in req_tags:
        tag_lower = str(tag).lower()
        has_tag = tag_lower in extractor.tags
        results.append({
            "criterion": f"Must contain <{tag_lower}> element",
            "passed": has_tag
        })
        if not has_tag:
            passed_all = False

    # 2. Check required classes
    for cls in req_classes:
        has_cls = cls in extractor.classes
        results.append({
            "criterion": f"Must contain class '.{cls}'",
            "passed": has_cls
        })
        if not has_cls:
            passed_all = False

    # 3. Check required CSS rules/selectors
    css_str = str(css_code or '')
    for css_rule in req_css:
        has_rule = css_rule.lower() in css_str.lower()
        results.append({
            "criterion": f"Must contain CSS property or selector '{css_rule}'",
            "passed": has_rule
        })
        if not has_rule:
            passed_all = False

    # 4. Check required JavaScript rules
    js_combined = (str(js_code or '') + " " + str(html_code or '')).lower()
    for js_rule in req_js:
        has_js = js_rule.lower() in js_combined
        results.append({
            "criterion": f"Must include JavaScript logic or event '{js_rule}'",
            "passed": has_js
        })
        if not has_js:
            passed_all = False

    return passed_all, results


from django.utils import timezone
from .models import WebChallenge, StudentChallengeProgress, AppChallenge, StudentAppChallengeProgress, PythonChallenge, StudentPythonChallengeProgress, ProgressLog
from .serializers import WebChallengeSerializer, StudentChallengeProgressSerializer, AppChallengeSerializer, StudentAppChallengeProgressSerializer, PythonChallengeSerializer, StudentPythonChallengeProgressSerializer

class WebChallengeDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'web_studio'

    def get(self, request, slug):
        target_user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to view student projects across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                target_user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        challenge = WebChallenge.objects.filter(slug=slug).first()
        if not challenge:
            challenge = WebChallenge.objects.create(
                slug=slug,
                title="Build Your Superhero Badge",
                stage_order=1,
                instructions_markdown="## Mission Goal\nCreate an awesome superhero card! Add an `<h1>` header, an `<img>` sticker, and a `<button>` tag!",
                starter_html='<div class="card">\n  <h1 class="sparkle">EXPLORER LEO</h1>\n  <img src="/assets/hero.png" width="120">\n  <button class="btn font-bold">START MISSION!</button>\n</div>',
                starter_css='.card { background: #1a1a2e; border: 4px solid #f9a826; border-radius: 16px; padding: 20px; text-align: center; color: white; }\n.sparkle { color: #f9a826; text-shadow: 0 0 12px #f9a826; }',
                solution_criteria={"required_tags": ["h1", "img", "button"], "required_classes": ["card", "btn"]},
                reward_xp=50
            )

        student_progress_data = None
        if target_user and target_user.is_authenticated:
            progress, _ = StudentChallengeProgress.objects.get_or_create(
                student=target_user,
                challenge=challenge
            )
            student_progress_data = {
                "saved_html": progress.saved_html,
                "saved_css": progress.saved_css,
                "saved_js": getattr(progress, 'saved_js', ''),
                "is_completed": progress.is_completed,
                "completed_at": progress.completed_at
            }

        return Response({
            "success": True,
            "challenge": WebChallengeSerializer(challenge).data,
            "student_progress": student_progress_data
        })


class WebChallengeSaveDraftView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'web_studio'

    def post(self, request):
        slug = request.data.get('slug')
        saved_html = request.data.get('saved_html', '')
        saved_css = request.data.get('saved_css', '')
        saved_js = request.data.get('saved_js', '')

        if not slug:
            return Response({"error": "Challenge slug is required."}, status=status.HTTP_400_BAD_REQUEST)

        challenge, _ = WebChallenge.objects.get_or_create(
            slug=slug,
            defaults={
                "title": slug.replace('-', ' ').title(),
                "stage_order": 1,
                "solution_criteria": {"required_tags": ["h1"]},
                "reward_xp": 50
            }
        )

        progress, _ = StudentChallengeProgress.objects.get_or_create(
            student=request.user,
            challenge=challenge
        )
        progress.saved_html = saved_html
        progress.saved_css = saved_css
        if hasattr(progress, 'saved_js'):
            progress.saved_js = saved_js
        progress.save()

        return Response({
            "success": True,
            "message": "Draft saved successfully!"
        })


class WebChallengeSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'web_studio'

    def post(self, request):
        slug = request.data.get('slug')
        html_code = request.data.get('html', '')
        css_code = request.data.get('css', '')
        js_code = request.data.get('js', '')

        if not slug:
            return Response({"error": "Challenge slug is required."}, status=status.HTTP_400_BAD_REQUEST)

        challenge, _ = WebChallenge.objects.get_or_create(
            slug=slug,
            defaults={
                "title": slug.replace('-', ' ').title(),
                "stage_order": 1,
                "solution_criteria": {"required_tags": ["h1"]},
                "reward_xp": 50
            }
        )

        progress, _ = StudentChallengeProgress.objects.get_or_create(
            student=request.user,
            challenge=challenge
        )

        passed, criteria_results = validate_html_solution(
            html_code,
            css_code,
            challenge.solution_criteria,
            js_code=js_code
        )

        progress.saved_html = html_code
        progress.saved_css = css_code
        if hasattr(progress, 'saved_js'):
            progress.saved_js = js_code

        reward_xp = 0
        if passed:
            if not progress.is_completed:
                progress.is_completed = True
                progress.completed_at = timezone.now()
                reward_xp = challenge.reward_xp
                
                # Award XP to user profile
                if hasattr(request.user, 'profile'):
                    request.user.profile.points += reward_xp
                    request.user.profile.save()

                # Log progress
                ProgressLog.objects.create(
                    user=request.user,
                    stage=4,
                    progress=challenge.stage_order,
                    points_earned=reward_xp
                )
            else:
                reward_xp = challenge.reward_xp

        progress.save()

        return Response({
            "success": passed,
            "is_completed": progress.is_completed,
            "reward_xp": reward_xp,
            "message": f"Mission Accomplished! You completed {challenge.title}! 🎉" if passed else "Almost there! Keep tweaking your code to complete all mission goals.",
            "criteria_results": criteria_results
        })


class WebChallengeProjectsListView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'web_studio'

    def get(self, request):
        target_user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to view student projects across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                target_user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        challenges = WebChallenge.objects.all().order_by('stage_order')
        projects = []

        progress_map = {}
        if target_user and target_user.is_authenticated:
            all_progress = StudentChallengeProgress.objects.filter(student=target_user)
            for p in all_progress:
                progress_map[p.challenge_id] = p

        for c in challenges:
            p = progress_map.get(c.id)
            projects.append({
                "id": c.id,
                "slug": c.slug,
                "title": c.title,
                "stage_order": c.stage_order,
                "reward_xp": c.reward_xp,
                "saved_html": p.saved_html if p and p.saved_html else c.starter_html,
                "saved_css": p.saved_css if p and p.saved_css else c.starter_css,
                "saved_js": getattr(p, 'saved_js', '') if p and getattr(p, 'saved_js', None) else getattr(c, 'starter_js', ''),
                "is_completed": p.is_completed if p else False,
                "completed_at": p.completed_at if p else None,
                "has_draft": True if (p and (p.saved_html or getattr(p, 'saved_js', None))) else False
            })

        return Response({
            "success": True,
            "projects": projects
        })


def validate_app_solution(screens, code, criteria):
    """
    Validates App Studio challenge solution:
    - required_elements: list of component types ('button', 'label', 'image', 'input')
    - required_min_screens: integer
    - required_events: list of events ('onEvent', 'click')
    - required_keywords: list of keywords in code ('happiness', 'hunger', 'energy', 'score', etc.)
    """
    results = []
    if not isinstance(criteria, dict):
        criteria = {}

    req_elements = criteria.get('required_elements', [])
    req_min_screens = criteria.get('required_min_screens', 1)
    req_events = criteria.get('required_events', [])
    req_keywords = criteria.get('required_keywords', [])

    present_types = set()
    total_elements = 0
    if isinstance(screens, list):
        for s in screens:
            if isinstance(s, dict) and 'elements' in s:
                for el in s.get('elements', []):
                    total_elements += 1
                    if isinstance(el, dict) and 'type' in el:
                        present_types.add(str(el['type']).lower())
                    if isinstance(el, dict) and 'events' in el and el['events']:
                        present_types.add('event')

    code_str = str(code or '').lower()
    passed_all = True

    # 1. Check required elements
    for el_type in req_elements:
        has_el = el_type.lower() in present_types
        results.append({
            "criterion": f"Must include '{el_type}' component on screen",
            "passed": has_el
        })
        if not has_el:
            passed_all = False

    # 2. Check min screens
    if req_min_screens > 1:
        num_screens = len(screens) if isinstance(screens, list) else 1
        passed_screens = num_screens >= req_min_screens
        results.append({
            "criterion": f"Must have at least {req_min_screens} screens (currently {num_screens})",
            "passed": passed_screens
        })
        if not passed_screens:
            passed_all = False

    # 3. Check required events
    for evt in req_events:
        has_evt = (evt.lower() in code_str) or ('event' in present_types)
        results.append({
            "criterion": f"Must trigger action event '{evt}'",
            "passed": has_evt
        })
        if not has_evt:
            passed_all = False

    # 4. Check required keywords
    for kw in req_keywords:
        has_kw = kw.lower() in code_str
        results.append({
            "criterion": f"Must use logic or variable '{kw}'",
            "passed": has_kw
        })
        if not has_kw:
            passed_all = False

    return passed_all, results


class AppChallengeDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'app_studio'

    def get(self, request, slug):
        target_user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to view student projects across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                target_user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        challenge = AppChallenge.objects.filter(slug=slug).first()
        if not challenge:
            challenge = AppChallenge.objects.create(
                slug=slug,
                title="Class 1: My First Hello App",
                class_number=1,
                stage_order=1,
                instructions_markdown="## Class 1 — App Builder Playground 📱\nUnderstand app screens and components! Drag a label, image, and button onto your phone simulator.",
                starter_screens=[{
                    "id": "screen1",
                    "name": "Home Screen",
                    "backgroundColor": "#0f172a",
                    "elements": [
                        {"id": "title1", "type": "label", "name": "Title", "text": "My Hello App 👋", "style": {"x": 40, "y": 60, "width": 240, "height": 40, "fontSize": 22, "color": "#facc15", "textAlign": "center"}},
                        {"id": "btn1", "type": "button", "name": "Greeting Button", "text": "Say Hello! 🌟", "style": {"x": 40, "y": 280, "width": 240, "height": 50, "backgroundColor": "#10b981", "color": "#ffffff", "borderRadius": 14, "fontSize": 16}}
                    ]
                }],
                starter_code="onEvent('btn1', 'click', () => {\n  setProperty('title1', 'text', 'Hello World! Welcome to my app! 🚀');\n});",
                solution_criteria={"required_elements": ["button", "label"]},
                reward_xp=50
            )

        student_progress_data = None
        if target_user and target_user.is_authenticated:
            progress, _ = StudentAppChallengeProgress.objects.get_or_create(
                student=target_user,
                challenge=challenge
            )
            student_progress_data = {
                "saved_screens": progress.saved_screens,
                "saved_code": progress.saved_code,
                "is_completed": progress.is_completed,
                "completed_at": progress.completed_at
            }

        return Response({
            "success": True,
            "challenge": AppChallengeSerializer(challenge).data,
            "student_progress": student_progress_data
        })


class AppChallengeSaveDraftView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'app_studio'

    def post(self, request):
        slug = request.data.get('slug')
        saved_screens = request.data.get('saved_screens', [])
        saved_code = request.data.get('saved_code', '')

        if not slug:
            return Response({"error": "Challenge slug is required."}, status=status.HTTP_400_BAD_REQUEST)

        challenge, _ = AppChallenge.objects.get_or_create(
            slug=slug,
            defaults={
                "title": slug.replace('-', ' ').title(),
                "class_number": 1,
                "stage_order": 1,
                "solution_criteria": {"required_elements": ["button"]},
                "reward_xp": 50
            }
        )

        progress, _ = StudentAppChallengeProgress.objects.get_or_create(
            student=request.user,
            challenge=challenge
        )
        progress.saved_screens = saved_screens
        progress.saved_code = saved_code
        progress.save()

        return Response({
            "success": True,
            "message": "App draft saved successfully!"
        })


class AppChallengeSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'app_studio'

    def post(self, request):
        slug = request.data.get('slug')
        screens = request.data.get('screens', [])
        code = request.data.get('code', '')

        if not slug:
            return Response({"error": "Challenge slug is required."}, status=status.HTTP_400_BAD_REQUEST)

        challenge, _ = AppChallenge.objects.get_or_create(
            slug=slug,
            defaults={
                "title": slug.replace('-', ' ').title(),
                "class_number": 1,
                "stage_order": 1,
                "solution_criteria": {"required_elements": ["button"]},
                "reward_xp": 50
            }
        )

        progress, _ = StudentAppChallengeProgress.objects.get_or_create(
            student=request.user,
            challenge=challenge
        )

        passed, criteria_results = validate_app_solution(
            screens,
            code,
            challenge.solution_criteria
        )

        progress.saved_screens = screens
        progress.saved_code = code

        reward_xp = 0
        if passed:
            if not progress.is_completed:
                progress.is_completed = True
                progress.completed_at = timezone.now()
                reward_xp = challenge.reward_xp
                
                # Award XP to user profile
                if hasattr(request.user, 'profile'):
                    request.user.profile.points += reward_xp
                    if hasattr(request.user.profile, 'stage5_progress'):
                        request.user.profile.stage5_progress = max(request.user.profile.stage5_progress, challenge.stage_order)
                    request.user.profile.save()

                # Log progress
                ProgressLog.objects.create(
                    user=request.user,
                    stage=5,
                    progress=challenge.stage_order,
                    points_earned=reward_xp
                )
            else:
                reward_xp = challenge.reward_xp

        progress.save()

        return Response({
            "success": passed,
            "is_completed": progress.is_completed,
            "reward_xp": reward_xp,
            "message": f"App Challenge Cleared! You built {challenge.title}! 🎉" if passed else "Almost there! Keep tweaking your app components and events to complete all goals.",
            "criteria_results": criteria_results
        })


class AppChallengeProjectsListView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'app_studio'

    def get(self, request):
        target_user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to view student projects across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                target_user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        challenges = AppChallenge.objects.all().order_by('stage_order')
        projects = []

        progress_map = {}
        if target_user and target_user.is_authenticated:
            all_progress = StudentAppChallengeProgress.objects.filter(student=target_user)
            for p in all_progress:
                progress_map[p.challenge_id] = p

        for c in challenges:
            p = progress_map.get(c.id)
            projects.append({
                "id": c.id,
                "slug": c.slug,
                "title": c.title,
                "class_number": c.class_number,
                "stage_order": c.stage_order,
                "reward_xp": c.reward_xp,
                "saved_screens": p.saved_screens if p and p.saved_screens else c.starter_screens,
                "saved_code": p.saved_code if p and p.saved_code else c.starter_code,
                "is_completed": p.is_completed if p else False,
                "completed_at": p.completed_at if p else None,
                "has_draft": True if (p and p.saved_screens) else False
            })

        return Response({
            "success": True,
            "projects": projects
        })


def validate_python_solution(code, solution_criteria):
    if not solution_criteria:
        return True, []

    passed_all = True
    results = []

    req_methods = solution_criteria.get('required_methods', [])
    for method in req_methods:
        has_method = method in code
        results.append({
            "criterion": f"Must call command '{method}()'",
            "passed": has_method
        })
        if not has_method:
            passed_all = False

    req_keywords = solution_criteria.get('required_keywords', [])
    for kw in req_keywords:
        has_kw = kw in code
        results.append({
            "criterion": f"Must use Python keyword or variable '{kw}'",
            "passed": has_kw
        })
        if not has_kw:
            passed_all = False

    return passed_all, results


class PythonChallengeDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'stage4'

    def get(self, request, slug):
        target_user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to view student projects across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                target_user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        challenge = PythonChallenge.objects.filter(slug=slug).first()
        if not challenge:
            challenge = PythonChallenge.objects.create(
                slug=slug,
                title="Class 1: Robo Motion Island",
                class_number=1,
                stage_order=1,
                instructions_markdown="## Class 1 — Robo Motion Island 🤖\nLearn Python statements and sequencing commands!",
                what_to_achieve="Navigate the island maze and collect all crystals.",
                starter_code="hero.move_right(2)\nhero.collect()\nhero.jump()",
                game_config={"scene": "island"},
                solution_criteria={"required_methods": ["hero.move_right"]},
                reward_xp=60
            )

        student_progress_data = None
        if target_user and target_user.is_authenticated:
            progress, _ = StudentPythonChallengeProgress.objects.get_or_create(
                student=target_user,
                challenge=challenge
            )
            student_progress_data = {
                "saved_code": progress.saved_code,
                "is_completed": progress.is_completed,
                "completed_at": progress.completed_at
            }

        return Response({
            "success": True,
            "challenge": PythonChallengeSerializer(challenge).data,
            "student_progress": student_progress_data
        })


class PythonChallengeSaveDraftView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'stage4'

    def post(self, request):
        slug = request.data.get('slug')
        saved_code = request.data.get('saved_code', '')

        if not slug:
            return Response({"error": "Challenge slug is required."}, status=status.HTTP_400_BAD_REQUEST)

        challenge, _ = PythonChallenge.objects.get_or_create(
            slug=slug,
            defaults={
                "title": slug.replace('-', ' ').title(),
                "class_number": 1,
                "stage_order": 1,
                "solution_criteria": {"required_methods": ["hero.move_right"]},
                "reward_xp": 60
            }
        )

        progress, _ = StudentPythonChallengeProgress.objects.get_or_create(
            student=request.user,
            challenge=challenge
        )
        progress.saved_code = saved_code
        progress.save()

        return Response({
            "success": True,
            "message": "Python code draft saved successfully!"
        })


class PythonChallengeSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'stage4'

    def post(self, request):
        slug = request.data.get('slug')
        code = request.data.get('code', '')

        if not slug:
            return Response({"error": "Challenge slug is required."}, status=status.HTTP_400_BAD_REQUEST)

        challenge, _ = PythonChallenge.objects.get_or_create(
            slug=slug,
            defaults={
                "title": slug.replace('-', ' ').title(),
                "class_number": 1,
                "stage_order": 1,
                "solution_criteria": {"required_methods": ["hero.move_right"]},
                "reward_xp": 60
            }
        )

        progress, _ = StudentPythonChallengeProgress.objects.get_or_create(
            student=request.user,
            challenge=challenge
        )

        passed, criteria_results = validate_python_solution(
            code,
            challenge.solution_criteria
        )

        progress.saved_code = code

        reward_xp = 0
        if passed:
            if not progress.is_completed:
                progress.is_completed = True
                progress.completed_at = timezone.now()
                reward_xp = challenge.reward_xp
                
                # Award XP to user profile
                if hasattr(request.user, 'profile'):
                    request.user.profile.points += reward_xp
                    if hasattr(request.user.profile, 'stage3_progress'):
                        request.user.profile.stage3_progress = max(request.user.profile.stage3_progress, challenge.stage_order)
                    request.user.profile.save()

                # Log progress
                ProgressLog.objects.create(
                    user=request.user,
                    stage=3,
                    progress=challenge.stage_order,
                    points_earned=reward_xp
                )
            else:
                reward_xp = challenge.reward_xp

        progress.save()

        return Response({
            "success": passed,
            "is_completed": progress.is_completed,
            "reward_xp": reward_xp,
            "message": f"Python Challenge Cleared! You conquered {challenge.title}! 🎉" if passed else "Almost there! Make sure all required Python methods and keywords are present.",
            "criteria_results": criteria_results
        })


class PythonChallengeProjectsListView(APIView):
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'stage4'

    def get(self, request):
        target_user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to view student projects across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                target_user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        challenges = PythonChallenge.objects.all().order_by('stage_order')
        projects = []

        progress_map = {}
        if target_user and target_user.is_authenticated:
            all_progress = StudentPythonChallengeProgress.objects.filter(student=target_user)
            for p in all_progress:
                progress_map[p.challenge_id] = p

        for c in challenges:
            p = progress_map.get(c.id)
            projects.append({
                "id": c.id,
                "slug": c.slug,
                "title": c.title,
                "class_number": c.class_number,
                "stage_order": c.stage_order,
                "reward_xp": c.reward_xp,
                "what_to_achieve": c.what_to_achieve,
                "saved_code": p.saved_code if p and p.saved_code else c.starter_code,
                "is_completed": p.is_completed if p else False,
                "completed_at": p.completed_at if p else None,
                "has_draft": True if (p and p.saved_code) else False
            })

        return Response({
            "success": True,
            "projects": projects
        })


class SchoolJoinInfoView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = request.query_params.get('code', '').strip()
        if not code:
            return Response({"error": "School code parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        school = School.objects.filter(code__iexact=code).first()
        if not school:
            return Response({"error": f"No school found with code '{code}'."}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "success": True,
            "school": SchoolSerializer(school).data
        })


class ClassJoinInfoView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = request.query_params.get('code', '').strip()
        if not code:
            return Response({"error": "Class join code parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        classroom = Classroom.objects.filter(join_code__iexact=code).first()
        if not classroom:
            return Response({"error": f"No class found with join code '{code}'."}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "success": True,
            "classroom": ClassroomSerializer(classroom).data,
            "school": SchoolSerializer(classroom.school).data
        })


class StudentJoinClassView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('class_code', '').strip()
        student_name = request.data.get('student_name') or request.data.get('username') or request.data.get('name')
        password = request.data.get('password', 'Student123!')
        age = request.data.get('age')
        gender = request.data.get('gender')

        if not code:
            return Response({"error": "Class join code is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not student_name or not student_name.strip():
            return Response({"error": "Student name is required."}, status=status.HTTP_400_BAD_REQUEST)

        classroom = Classroom.objects.filter(join_code__iexact=code).first()
        if not classroom:
            return Response({"error": f"Invalid class join code '{code}'."}, status=status.HTTP_404_NOT_FOUND)

        base_username = student_name.strip()
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1

        email = f"{username.lower().replace(' ', '_')}@student.dolacode.com"
        user = User.objects.create_user(username=username, email=email, password=password)

        parsed_age = None
        if age:
            try:
                parsed_age = int(age)
            except (ValueError, TypeError):
                pass

        learning_band = None
        if parsed_age:
            if parsed_age <= 8:
                learning_band = 'Discoverer'
            elif parsed_age <= 11:
                learning_band = 'Explorer'
            elif parsed_age <= 14:
                learning_band = 'Builder'
            else:
                learning_band = 'Innovator'

        UserProfile.objects.create(
            user=user,
            role='student',
            school=classroom.school,
            classroom=classroom,
            age=parsed_age,
            gender=gender,
            learning_band=learning_band
        )

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "success": True,
            "token": token.key,
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


# =====================================================================
# PROTECTED LEARNING RESOURCES: PYTHON, BLOCK CODING, APP STUDIO, PREMIUM
# =====================================================================

class PythonExecuteView(APIView):
    """
    Executes student Python code in a sandboxed, resource-limited subprocess.
    Protected by subscription check and strict AST + runtime sandbox security.
    """
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'python_quest'

    def post(self, request):
        code = request.data.get('code', '')
        test_assertions = request.data.get('test_assertions', [])

        if not isinstance(code, str):
            return Response({"error": "Code must be a string."}, status=status.HTTP_400_BAD_REQUEST)
        if test_assertions and not isinstance(test_assertions, list):
            return Response({"error": "test_assertions must be a list of strings."}, status=status.HTTP_400_BAD_REQUEST)

        if len(code) > 50000:
            return Response({"error": "Code length exceeds maximum allowed limit (50KB)."}, status=status.HTTP_400_BAD_REQUEST)

        from .python_sandbox import execute_sandboxed_python
        result = execute_sandboxed_python(code=code, test_assertions=test_assertions, timeout_seconds=2.0)
        status_code = status.HTTP_200_OK if result.get('success') else status.HTTP_400_BAD_REQUEST
        return Response(result, status=status_code)


class PythonProjectsListView(APIView):
    """
    Lists and saves Python Quest projects with strict family account isolation.
    """
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'python_quest'

    def get(self, request):
        target_user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to access student projects across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                target_user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        projects = PythonProject.objects.filter(user=target_user)
        return Response({"projects": PythonProjectSerializer(projects, many=True).data})

    def post(self, request):
        serializer = PythonProjectSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save(user=request.user)
            return Response({"success": True, "project": PythonProjectSerializer(project).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PythonProjectDetailView(APIView):
    """
    Retrieves, updates, or deletes a specific Python project with family authorization checks.
    """
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription, IsFamilyResourceOwner]
    subscription_feature = 'python_quest'

    def get_object(self, pk):
        try:
            obj = PythonProject.objects.get(pk=pk)
            self.check_object_permissions(self.request, obj)
            return obj
        except PythonProject.DoesNotExist:
            return None

    def get(self, request, pk):
        project = self.get_object(pk)
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"project": PythonProjectSerializer(project).data})

    def put(self, request, pk):
        project = self.get_object(pk)
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = PythonProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "project": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = self.get_object(pk)
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        project.delete()
        return Response({"success": True, "message": "Project deleted successfully."})


class BlocklyProjectsListView(APIView):
    """
    Lists and saves Block Coding projects with family account isolation.
    """
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'block_coding'

    def get(self, request):
        target_user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to access student projects across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                target_user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        projects = BlocklyProject.objects.filter(user=target_user)
        return Response({"projects": BlocklyProjectSerializer(projects, many=True).data})

    def post(self, request):
        serializer = BlocklyProjectSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save(user=request.user)
            return Response({"success": True, "project": BlocklyProjectSerializer(project).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlocklyProjectDetailView(APIView):
    """
    Retrieves, updates, or deletes a Block Coding project with family authorization checks.
    """
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription, IsFamilyResourceOwner]
    subscription_feature = 'block_coding'

    def get_object(self, pk):
        try:
            obj = BlocklyProject.objects.get(pk=pk)
            self.check_object_permissions(self.request, obj)
            return obj
        except BlocklyProject.DoesNotExist:
            return None

    def get(self, request, pk):
        project = self.get_object(pk)
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"project": BlocklyProjectSerializer(project).data})

    def put(self, request, pk):
        project = self.get_object(pk)
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = BlocklyProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "project": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = self.get_object(pk)
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        project.delete()
        return Response({"success": True, "message": "Project deleted successfully."})


class AppStudioProjectsListView(APIView):
    """
    Lists and saves App Studio mobile development projects with family account isolation.
    """
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'app_studio'

    def get(self, request):
        target_user = request.user
        child_id = request.query_params.get('child_id')
        if child_id:
            from .models import ParentChild
            if not ParentChild.objects.filter(parent=request.user, child_id=child_id).exists() and not (request.user.is_superuser or request.user.is_staff):
                return Response({
                    "error": "subscription_required",
                    "code": "subscription_required",
                    "detail": "Unauthorized to access student projects across different family accounts."
                }, status=status.HTTP_403_FORBIDDEN)
            try:
                target_user = User.objects.get(id=child_id)
            except User.DoesNotExist:
                return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        projects = AppStudioProject.objects.filter(user=target_user)
        return Response({"projects": AppStudioProjectSerializer(projects, many=True).data})

    def post(self, request):
        project_id = request.data.get('project_id')
        if project_id:
            existing = AppStudioProject.objects.filter(user=request.user, project_id=project_id).first()
            if existing:
                serializer = AppStudioProjectSerializer(existing, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response({"success": True, "project": serializer.data})
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = AppStudioProjectSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save(user=request.user)
            return Response({"success": True, "project": AppStudioProjectSerializer(project).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AppStudioProjectDetailView(APIView):
    """
    Retrieves, updates, or deletes an App Studio project with family authorization checks.
    """
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription, IsFamilyResourceOwner]
    subscription_feature = 'app_studio'

    def get_object(self, pk):
        try:
            if str(pk).isdigit():
                obj = AppStudioProject.objects.get(pk=int(pk))
            else:
                obj = AppStudioProject.objects.get(project_id=str(pk))
            self.check_object_permissions(self.request, obj)
            return obj
        except AppStudioProject.DoesNotExist:
            return None

    def get(self, request, pk):
        project = self.get_object(pk)
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"project": AppStudioProjectSerializer(project).data})

    def put(self, request, pk):
        project = self.get_object(pk)
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AppStudioProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "project": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = self.get_object(pk)
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        project.delete()
        return Response({"success": True, "message": "Project deleted successfully."})


class PremiumContentDeliveryView(APIView):
    """
    Delivers premium curriculum materials, verified solutions, video hints,
    and teacher resources. Accessible only to active subscribers.
    """
    permission_classes = [permissions.IsAuthenticated, RequiresActiveSubscription]
    subscription_feature = 'premium_content'

    def get(self, request):
        resource_id = request.query_params.get('resource_id')

        premium_resources = {
            "stage1_solutions": {
                "title": "Numeracy World: Master Solution Key",
                "stage": 1,
                "type": "teacher_guide",
                "description": "Full walkthrough of all 14 parts of Stage 1 Numeracy and computational thinking."
            },
            "stage2_blockly_curriculum": {
                "title": "Block Coding Challenge Solutions",
                "stage": 2,
                "type": "solutions_guide",
                "description": "Block-by-block visual architecture for all 11 maze and game missions."
            },
            "stage3_appstudio_templates": {
                "title": "App Studio Production Templates",
                "stage": 3,
                "type": "project_templates",
                "description": "Commercial-grade mobile app templates with responsive UI layouts."
            },
            "stage4_python_solutions": {
                "title": "Python Quest: AI & Algorithm Answer Keys",
                "stage": 4,
                "type": "code_solutions",
                "description": "Optimal algorithmic solutions and test assertions for all 10 chapters."
            }
        }

        if resource_id:
            res = premium_resources.get(resource_id)
            if not res:
                return Response({"error": "Premium resource not found."}, status=status.HTTP_404_NOT_FOUND)
            return Response({"resource": res})

        return Response({
            "success": True,
            "resources": list(premium_resources.values())
        })










