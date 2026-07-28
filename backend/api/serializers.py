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
        fields = ('id', 'school', 'school_name', 'name', 'grade_level', 'teacher', 'teacher_name', 'created_at')

class UserProfileSerializer(serializers.ModelSerializer):
    school_details = SchoolSerializer(source='school', read_only=True)
    classroom_details = ClassroomSerializer(source='classroom', read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            'role', 'age', 'gender', 'coding_experience', 'points', 
            'current_streak', 'longest_streak', 'last_active_date',
            'stage1_progress', 'stage2_progress', 'stage3_progress', 'stage4_progress',
            'school', 'school_details', 'classroom', 'classroom_details'
        )

class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    earned_badges = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_superuser', 'profile', 'earned_badges')
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


        username = validated_data.get('username') or validated_data.get('email')
        user = User.objects.create_user(
            username=username,
            email=validated_data.get('email'),
            password=validated_data.get('password')
        )
        
        # If superuser or requested super_admin
        if validated_data.get('email', '').endswith('@devnaija.com'):
            role = 'super_admin'

        UserProfile.objects.create(
            user=user,
            role=role,
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
