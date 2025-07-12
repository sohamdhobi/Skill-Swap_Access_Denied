from django.contrib import admin
from django.urls import path
from skill_swap import views

urlpatterns = [
    path('admin/', admin.site.urls),
    # Authentication URLs
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    
    # User Profile URLs
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    
    # Skill Category URLs
    path('skill-categories/', views.SkillCategoryListView.as_view(), name='skill-categories'),
    
    # Skill URLs
    path('skills/', views.SkillListView.as_view(), name='skills'),
    path('skills/search/', views.PublicSkillSearchView.as_view(), name='public-skills'),
    path('skills/recommendations/', views.skill_recommendations, name='skill-recommendations'),
    path('users/search-by-skill/', views.search_users_by_skill, name='search-users-by-skill'),
    
    # User Skill URLs
    path('my-skills/', views.UserSkillListView.as_view(), name='user-skills'),
    path('my-skills/<uuid:pk>/', views.UserSkillDetailView.as_view(), name='user-skill-detail'),
    
    # Swap Request URLs
    path('swap-requests/', views.SwapRequestListView.as_view(), name='swap-requests'),
    path('swap-requests/<uuid:pk>/', views.SwapRequestDetailView.as_view(), name='swap-request-detail'),
    path('swap-requests/<uuid:swap_id>/accept/', views.accept_swap_request, name='accept-swap'),
    path('swap-requests/<uuid:swap_id>/reject/', views.reject_swap_request, name='reject-swap'),
    
    # Meeting URLs
    path('meetings/', views.MeetingListView.as_view(), name='meetings'),
    path('meetings/<uuid:pk>/', views.MeetingDetailView.as_view(), name='meeting-detail'),
    
    # Learning Material URLs
    path('learning-materials/', views.LearningMaterialListView.as_view(), name='learning-materials'),
    path('learning-materials/<uuid:pk>/', views.LearningMaterialDetailView.as_view(), name='learning-material-detail'),
    
    # Rating URLs
    path('ratings/', views.RatingListView.as_view(), name='ratings'),
    path('ratings/<uuid:pk>/', views.RatingDetailView.as_view(), name='rating-detail'),
    
    # Notification URLs
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    path('notifications/<uuid:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
    
    # Chat URLs
    path('chats/', views.ChatListView.as_view(), name='chats'),
    path('chats/<uuid:pk>/', views.ChatDetailView.as_view(), name='chat-detail'),
    path('chats/<uuid:chat_id>/messages/', views.ChatMessageListView.as_view(), name='chat-messages'),
    
    # Admin URLs
    path('admin/messages/', views.AdminMessageListView.as_view(), name='admin-messages'),
    path('admin/stats/', views.admin_dashboard_stats, name='admin-stats'),
    
    # Dashboard URLs
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
]
