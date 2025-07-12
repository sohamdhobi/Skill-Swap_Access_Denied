from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, SkillViewSet, SwapRequestViewSet

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'swaps', SwapRequestViewSet)

urlpatterns = router.urls
