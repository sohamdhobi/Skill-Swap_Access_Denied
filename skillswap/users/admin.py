from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UserProfile, Skill, SwapRequest, Chat, Message, Meeting


@admin.register(UserProfile)
class UserProfileAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'location', 'is_public', 'is_active']
    list_filter = ['is_public', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['username']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Skill-Swap Profile', {'fields': ('location', 'photo', 'is_public')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Skill-Swap Profile', {'fields': ('location', 'photo', 'is_public')}),
    )


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'offered', 'created_at']
    list_filter = ['offered', 'created_at']
    search_fields = ['name', 'owner__username']
    ordering = ['-created_at']


@admin.register(SwapRequest)
class SwapRequestAdmin(admin.ModelAdmin):
    list_display = ['from_user', 'to_user', 'offered_skill', 'requested_skill', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['from_user__username', 'to_user__username', 'offered_skill__name', 'requested_skill__name']
    ordering = ['-created_at']


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ['swap_request', 'created_at']
    list_filter = ['created_at']
    search_fields = ['swap_request__from_user__username', 'swap_request__to_user__username']
    ordering = ['-created_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'chat', 'content', 'created_at']
    list_filter = ['created_at']
    search_fields = ['sender__username', 'content']
    ordering = ['-created_at']


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer', 'meeting_type', 'status', 'scheduled_at', 'created_at']
    list_filter = ['meeting_type', 'status', 'created_at']
    search_fields = ['title', 'organizer__username', 'description']
    ordering = ['-created_at']
