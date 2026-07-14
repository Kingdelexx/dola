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

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            'age', 'coding_experience', 'points', 
            'current_streak', 'longest_streak', 'last_active_date',
            'stage1_progress', 'stage2_progress', 'stage3_progress', 'stage4_progress'
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
        profile_data = validated_data.pop('profile', {})
        # Use email as username if username is not provided, or just use email prefix
        user = User.objects.create_user(
            username=validated_data.get('username', validated_data.get('email')),
            email=validated_data.get('email'),
            password=validated_data.get('password')
        )
        UserProfile.objects.create(
            user=user,
            age=profile_data.get('age'),
            coding_experience=profile_data.get('coding_experience')
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
