from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import UserProfileViewSet, SkillViewSet, SwapRequestViewSet, RegisterView, LoginView, ChatViewSet, MessageViewSet, MeetingViewSet

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'swaps', SwapRequestViewSet)
router.register(r'chats', ChatViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'meetings', MeetingViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/', obtain_auth_token, name='token'),
] 