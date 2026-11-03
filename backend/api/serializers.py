from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Badge, UserBadge, Feedback
from django.contrib.auth import authenticate

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ('id', 'name', 'description', 'icon', 'condition_type', 'condition_value')

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    class Meta:
        model = UserBadge
        fields = ('badge', 'earned_at')

from .models import UserProfile, Badge, UserBadge, Feedback, School, Classroom, ParentChild

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = (
            'id', 'name', 'code', 'status', 'address', 'contact_person', 
            'contact_email', 'principal_email', 'number_of_pupils', 
            'phone_number', 'expected_classes', 'created_at'
        )

class ClassroomSerializer(serializers.ModelSerializer):
    school_name = serializers.ReadOnlyField(source='school.name')
    teacher_name = serializers.ReadOnlyField(source='teacher.username')

    class Meta:
        model = Classroom
        fields = ('id', 'school', 'school_name', 'name', 'grade_level', 'teacher', 'teacher_name', 'join_code', 'created_at')

from .models import UserProfile, Badge, UserBadge, Feedback, School, Classroom, ParentChild, StudentCompetency, PizzaShopProgress, RobotMazeProgress, MyLittleShopProgress, FrogAdventureProgress, TrafficRescueProgress, PetRescueProgress

class PetRescueProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetRescueProgress
        fields = (
            'current_level', 'stars_earned', 'dola_coins', 'xp_earned',
            'happiness_points', 'accuracy', 'attempts', 'pets_helped',
            'counting_accuracy', 'classification_accuracy', 'sequence_accuracy',
            'pattern_accuracy', 'condition_usage', 'loops_completed',
            'debugging_accuracy', 'hints_used', 'time_spent_seconds',
            'unlocked_pets', 'unlocked_accessories', 'badges', 'updated_at'
        )

class PizzaShopProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = PizzaShopProgress
        fields = (
            'current_level', 'stars_earned', 'dola_coins', 'xp_earned',
            'accuracy', 'attempts', 'correct_orders', 'time_spent_seconds',
            'counting_accuracy', 'addition_accuracy', 'subtraction_accuracy',
            'problem_solving_accuracy', 'hints_used', 'coding_concepts_completed',
            'badges', 'updated_at'
        )

class RobotMazeProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = RobotMazeProgress
        fields = (
            'current_level', 'stars_earned', 'dola_coins', 'xp_earned',
            'accuracy', 'attempts', 'missions_completed', 'commands_used',
            'hints_used', 'debugging_attempts', 'loops_completed',
            'time_spent_seconds', 'badges', 'updated_at'
        )

class MyLittleShopProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyLittleShopProgress
        fields = (
            'current_level', 'stars_earned', 'dola_coins', 'xp_earned',
            'accuracy', 'attempts', 'customers_served', 'addition_accuracy',
            'subtraction_accuracy', 'money_recognition_accuracy', 'change_accuracy',
            'multiplication_accuracy', 'profit_accuracy', 'stock_accuracy',
            'problem_solving_accuracy', 'hints_used', 'time_spent_seconds',
            'shop_upgrades', 'badges', 'updated_at'
        )

class FrogAdventureProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = FrogAdventureProgress
        fields = (
            'current_level', 'stars_earned', 'dola_coins', 'xp_earned',
            'accuracy', 'attempts', 'fruits_collected', 'counting_accuracy',
            'sequence_accuracy', 'pattern_accuracy', 'coordinates_accuracy',
            'route_planning_accuracy', 'loops_completed', 'debugging_attempts',
            'hints_used', 'time_spent_seconds', 'unlocked_costumes', 'badges', 'updated_at'
        )

class TrafficRescueProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficRescueProgress
        fields = (
            'current_level', 'stars_earned', 'dola_coins', 'xp_earned',
            'city_points', 'accuracy', 'attempts', 'vehicles_guided',
            'pedestrians_saved', 'sequencing_ability', 'logical_reasoning',
            'condition_usage', 'timing_accuracy', 'debugging_accuracy',
            'hints_used', 'time_spent_seconds', 'city_upgrades', 'badges', 'updated_at'
        )

class StudentCompetencySerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentCompetency
        fields = ('id', 'competency', 'status', 'updated_at')

class UserProfileSerializer(serializers.ModelSerializer):
    school_details = SchoolSerializer(source='school', read_only=True)
    classroom_details = ClassroomSerializer(source='classroom', read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            'role', 'age', 'learning_band', 'starting_score', 'gender', 'coding_experience', 'points', 
            'current_streak', 'longest_streak', 'last_active_date',
            'stage1_progress', 'stage2_progress', 'stage3_progress', 'stage4_progress',
            'school', 'school_details', 'classroom', 'classroom_details'
        )

class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    earned_badges = serializers.SerializerMethodField()
    competencies = serializers.SerializerMethodField()
    pizza_shop_progress = serializers.SerializerMethodField()
    robot_maze_progress = serializers.SerializerMethodField()
    my_little_shop_progress = serializers.SerializerMethodField()
    frog_adventure_progress = serializers.SerializerMethodField()
    traffic_rescue_progress = serializers.SerializerMethodField()
    pet_rescue_progress = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_superuser', 'profile', 'earned_badges', 'competencies', 'pizza_shop_progress', 'robot_maze_progress', 'my_little_shop_progress', 'frog_adventure_progress', 'traffic_rescue_progress', 'pet_rescue_progress')
        extra_kwargs = {
            'password': {'write_only': True},
            'is_superuser': {'read_only': True}
        }

    def get_profile(self, obj):
        try:
            return UserProfileSerializer(obj.profile).data
        except UserProfile.DoesNotExist:
            return None

    def get_earned_badges(self, obj):
        badges = UserBadge.objects.filter(user=obj)
        return UserBadgeSerializer(badges, many=True).data

    def get_competencies(self, obj):
        competencies = StudentCompetency.objects.filter(user=obj)
        return StudentCompetencySerializer(competencies, many=True).data

    def get_pizza_shop_progress(self, obj):
        prog = getattr(obj, 'pizza_shop_progress', None)
        if prog:
            return PizzaShopProgressSerializer(prog).data
        return None

    def get_robot_maze_progress(self, obj):
        prog = getattr(obj, 'robot_maze_progress', None)
        if prog:
            return RobotMazeProgressSerializer(prog).data
        return None

    def get_my_little_shop_progress(self, obj):
        prog = getattr(obj, 'my_little_shop_progress', None)
        if prog:
            return MyLittleShopProgressSerializer(prog).data
        return None

    def get_frog_adventure_progress(self, obj):
        prog = getattr(obj, 'frog_adventure_progress', None)
        if prog:
            return FrogAdventureProgressSerializer(prog).data
        return None

    def get_traffic_rescue_progress(self, obj):
        prog = getattr(obj, 'traffic_rescue_progress', None)
        if prog:
            return TrafficRescueProgressSerializer(prog).data
        return None

    def get_pet_rescue_progress(self, obj):
        prog = getattr(obj, 'pet_rescue_progress', None)
        if prog:
            return PetRescueProgressSerializer(prog).data
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        role = 'student'
        school_obj = None
        
        if request and request.data:
            role = request.data.get('role', 'student')
            school_code = request.data.get('school_code')
            school_name = request.data.get('school_name')

            if school_code:
                try:
                    school_obj = School.objects.get(code=school_code.strip())
                except School.DoesNotExist:
                    pass

            if not school_obj and school_name and role == 'school_admin':
                import random, string
                code = f"SCH-{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
                num_pupils = request.data.get('number_of_pupils')
                try:
                    num_pupils = int(num_pupils) if num_pupils else None
                except (ValueError, TypeError):
                    num_pupils = None

                school_obj = School.objects.create(
                    name=school_name,
                    code=code,
                    status='PENDING',
                    address=request.data.get('address', ''),
                    contact_person=request.data.get('contact_person', ''),
                    contact_email=validated_data.get('email'),
                    principal_email=request.data.get('principal_email', ''),
                    number_of_pupils=num_pupils,
                    phone_number=request.data.get('phone_number', ''),
                    expected_classes=request.data.get('expected_classes', '')
                )

                try:
                    from .emails import send_school_registration_email
                    recipients = [
                        school_obj.contact_email,
                        school_obj.principal_email,
                        validated_data.get('email')
                    ]
                    send_school_registration_email(school_obj, recipients)
                except Exception as e:
                    print("Error triggering registration email:", e)


        username = validated_data.get('username') or validated_data.get('email')
        user = User.objects.create_user(
            username=username,
            email=validated_data.get('email'),
            password=validated_data.get('password')
        )
        
        # If superuser or requested super_admin
        if validated_data.get('email', '').endswith('@devnaija.com'):
            role = 'super_admin'

        age = None
        coding_experience = ''
        if request and request.data:
            profile_data = request.data.get('profile', {})
            if isinstance(profile_data, dict):
                age = profile_data.get('age')
                coding_experience = profile_data.get('coding_experience', '')
                if age:
                    try:
                        age = int(age)
                    except (ValueError, TypeError):
                        age = None

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
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            # Check if user exists with this email
            try:
                user_obj = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")
            
            user = authenticate(username=user_obj.username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                data['user'] = user
            else:
                raise serializers.ValidationError("Invalid email or password.")
        else:
            raise serializers.ValidationError("Must include 'email' and 'password'.")
        
        return data

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ('id', 'user', 'stage', 'part', 'rating', 'difficulty', 'enjoyment', 'comments', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')


from .models import WebChallenge, StudentChallengeProgress, BlocklyProject, PythonProject, AppStudioProject

class WebChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebChallenge
        fields = (
            'id', 'slug', 'title', 'stage_order', 'instructions_markdown',
            'starter_html', 'starter_css', 'solution_criteria', 'reward_xp'
        )

class StudentChallengeProgressSerializer(serializers.ModelSerializer):
    challenge = WebChallengeSerializer(read_only=True)

    class Meta:
        model = StudentChallengeProgress
        fields = ('id', 'challenge', 'saved_html', 'saved_css', 'is_completed', 'completed_at')


class BlocklyProjectSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = BlocklyProject
        fields = (
            'id', 'username', 'title', 'description', 'workspace_xml',
            'python_code', 'level_index', 'sprites_data', 'is_completed',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'username', 'created_at', 'updated_at')


class PythonProjectSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = PythonProject
        fields = (
            'id', 'username', 'title', 'description', 'code',
            'chapter_id', 'level_id', 'is_favorite', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'username', 'created_at', 'updated_at')


class AppStudioProjectSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = AppStudioProject
        fields = (
            'id', 'username', 'project_id', 'name', 'screens', 'assets',
            'code', 'blockly_xml', 'is_favorite', 'is_archived',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'username', 'created_at', 'updated_at')


