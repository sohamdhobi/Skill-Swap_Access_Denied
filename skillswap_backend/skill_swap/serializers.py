from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, Skill, SkillCategory, UserSkill, SwapRequest, 
    Meeting, LearningMaterial, Rating, Notification, AdminMessage,
    Chat, ChatMessage
)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Password and confirm password don't match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    skills_offered = serializers.SerializerMethodField()
    skills_requested = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_swaps = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'profile_photo', 'location', 'bio', 'is_public', 'availability',
            'phone', 'created_at', 'skills_offered', 'skills_requested',
            'average_rating', 'total_swaps'
        ]

    def get_skills_offered(self, obj):
        skills = UserSkill.objects.filter(user=obj, skill_type='offer', is_active=True)
        return UserSkillSerializer(skills, many=True).data

    def get_skills_requested(self, obj):
        skills = UserSkill.objects.filter(user=obj, skill_type='request', is_active=True)
        return UserSkillSerializer(skills, many=True).data

    def get_average_rating(self, obj):
        ratings = Rating.objects.filter(rated_user=obj)
        if ratings.exists():
            return round(sum(r.rating for r in ratings) / len(ratings), 1)
        return 0

    def get_total_swaps(self, obj):
        return SwapRequest.objects.filter(
            models.Q(requester=obj) | models.Q(receiver=obj),
            status='completed'
        ).count()

class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'description', 'icon']

class SkillSerializer(serializers.ModelSerializer):
    category = SkillCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Skill
        fields = ['id', 'name', 'description', 'category', 'category_id', 'is_approved']

class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.CharField(write_only=True)
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = UserSkill
        fields = [
            'id', 'skill', 'skill_id', 'skill_type', 'proficiency_level',
            'description', 'experience_years', 'is_active', 'user_details'
        ]

    def get_user_details(self, obj):
        if obj.user.is_public:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'profile_photo': obj.user.profile_photo.url if obj.user.profile_photo else None,
                'location': obj.user.location,
                'availability': obj.user.availability,
            }
        return None

class SwapRequestSerializer(serializers.ModelSerializer):
    requester = UserProfileSerializer(read_only=True)
    receiver = UserProfileSerializer(read_only=True)
    offered_skill = UserSkillSerializer(read_only=True)
    requested_skill = UserSkillSerializer(read_only=True)
    
    offered_skill_id = serializers.CharField(write_only=True)
    requested_skill_id = serializers.CharField(write_only=True)
    receiver_id = serializers.CharField(write_only=True)

    class Meta:
        model = SwapRequest
        fields = [
            'id', 'requester', 'receiver', 'offered_skill', 'requested_skill',
            'offered_skill_id', 'requested_skill_id', 'receiver_id',
            'message', 'status', 'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        validated_data['requester'] = self.context['request'].user
        return super().create(validated_data)

class MeetingSerializer(serializers.ModelSerializer):
    swap_request = SwapRequestSerializer(read_only=True)
    swap_request_id = serializers.CharField(write_only=True)

    class Meta:
        model = Meeting
        fields = [
            'id', 'swap_request', 'swap_request_id', 'title', 'description',
            'scheduled_time', 'duration_minutes', 'meeting_link', 'status',
            'created_at', 'updated_at'
        ]

class LearningMaterialSerializer(serializers.ModelSerializer):
    uploader = UserProfileSerializer(read_only=True)
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.CharField(write_only=True)

    class Meta:
        model = LearningMaterial
        fields = [
            'id', 'uploader', 'skill', 'skill_id', 'title', 'description',
            'material_type', 'file', 'url', 'is_public', 'created_at'
        ]

    def create(self, validated_data):
        validated_data['uploader'] = self.context['request'].user
        return super().create(validated_data)

class RatingSerializer(serializers.ModelSerializer):
    rater = UserProfileSerializer(read_only=True)
    rated_user = UserProfileSerializer(read_only=True)
    swap_request = SwapRequestSerializer(read_only=True)
    
    swap_request_id = serializers.CharField(write_only=True)
    rated_user_id = serializers.CharField(write_only=True)

    class Meta:
        model = Rating
        fields = [
            'id', 'swap_request', 'swap_request_id', 'rater', 'rated_user',
            'rated_user_id', 'rating', 'comment', 'created_at'
        ]

    def create(self, validated_data):
        validated_data['rater'] = self.context['request'].user
        return super().create(validated_data)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'is_read', 'created_at'
        ]

class AdminMessageSerializer(serializers.ModelSerializer):
    admin = UserProfileSerializer(read_only=True)

    class Meta:
        model = AdminMessage
        fields = ['id', 'admin', 'title', 'message', 'is_active', 'created_at']

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserProfileSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'message', 'is_read', 'created_at']

class ChatSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    swap_request = SwapRequestSerializer(read_only=True)
    recent_message = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'swap_request', 'messages', 'recent_message', 'created_at']

    def get_recent_message(self, obj):
        recent = obj.messages.order_by('-created_at').first()
        return ChatMessageSerializer(recent).data if recent else None

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            if user.is_banned:
                raise serializers.ValidationError('User account is banned')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        return attrs