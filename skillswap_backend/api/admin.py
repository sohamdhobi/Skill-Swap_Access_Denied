from django.contrib import admin
from .models import UserProfile, Skill, SwapRequest

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'location', 'is_public')
    search_fields = ('username', 'email', 'location')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'offered')
    search_fields = ('name', 'owner__username')
    list_filter = ('offered',)

@admin.register(SwapRequest)
class SwapRequestAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'offered_skill', 'requested_skill', 'status', 'created_at')
    search_fields = ('from_user__username', 'to_user__username', 'status')
    list_filter = ('status',)
