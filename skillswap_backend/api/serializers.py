from rest_framework import serializers
from .models import UserProfile, Skill, SwapRequest
from django.contrib.auth import get_user_model

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'location', 'photo', 'is_public']

class SkillSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField()
    class Meta:
        model = Skill
        fields = ['id', 'name', 'owner', 'offered']

class SwapRequestSerializer(serializers.ModelSerializer):
    from_user = serializers.StringRelatedField()
    to_user = serializers.StringRelatedField()
    offered_skill = SkillSerializer()
    requested_skill = SkillSerializer()
    class Meta:
        model = SwapRequest
        fields = ['id', 'from_user', 'to_user', 'offered_skill', 'requested_skill', 'status', 'created_at', 'updated_at']
