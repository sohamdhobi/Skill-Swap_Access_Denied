from rest_framework import serializers
from .models import UserProfile, Skill, SwapRequest, Chat, Message, Meeting


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'location', 'photo', 'is_public', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class SkillSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = Skill
        fields = ['id', 'name', 'owner', 'owner_name', 'offered', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']


class SwapRequestSerializer(serializers.ModelSerializer):
    from_user_name = serializers.CharField(source='from_user.username', read_only=True)
    to_user_name = serializers.CharField(source='to_user.username', read_only=True)
    offered_skill_name = serializers.CharField(source='offered_skill.name', read_only=True)
    requested_skill_name = serializers.CharField(source='requested_skill.name', read_only=True)
    
    class Meta:
        model = SwapRequest
        fields = [
            'id', 'from_user', 'from_user_name', 'to_user', 'to_user_name',
            'offered_skill', 'offered_skill_name', 'requested_skill', 'requested_skill_name',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'from_user', 'from_user_name', 'created_at', 'updated_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'sender_name', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'sender', 'sender_name', 'created_at', 'updated_at']


class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    participants = serializers.SerializerMethodField()
    
    class Meta:
        model = Chat
        fields = ['id', 'swap_request', 'messages', 'participants', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_participants(self, obj):
        return [
            {'id': user.id, 'username': user.username}
            for user in obj.participants
        ]


class MeetingSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)
    participants = serializers.SerializerMethodField()
    
    class Meta:
        model = Meeting
        fields = [
            'id', 'chat', 'organizer', 'organizer_name', 'meeting_type', 'title', 
            'description', 'scheduled_at', 'duration_minutes', 'meeting_url', 
            'meeting_id', 'status', 'participants', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'organizer', 'organizer_name', 'created_at', 'updated_at']
    
    def get_participants(self, obj):
        return [
            {'id': user.id, 'username': user.username}
            for user in obj.participants
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'location', 'is_public']
    
    def create(self, validated_data):
        user = UserProfile.objects.create_user(**validated_data)
        return user 