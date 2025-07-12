from django.contrib import admin
from .models import (
    User, SkillCategory, Skill, UserSkill, SwapRequest,
    Meeting, LearningMaterial, Rating, Notification,
    AdminMessage, Chat, ChatMessage
)

admin.site.register(User)
admin.site.register(SkillCategory)
admin.site.register(Skill)
admin.site.register(UserSkill)
admin.site.register(SwapRequest)
admin.site.register(Meeting)
admin.site.register(LearningMaterial)
admin.site.register(Rating)
admin.site.register(Notification)
admin.site.register(AdminMessage)
admin.site.register(Chat)
admin.site.register(ChatMessage)
