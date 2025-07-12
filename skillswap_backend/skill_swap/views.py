from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import login
from django.db.models import Q, Avg
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    User, Skill, SkillCategory, UserSkill, SwapRequest, 
    Meeting, LearningMaterial, Rating, Notification, AdminMessage,
    Chat, ChatMessage
)
from .serializers import (
    UserRegistrationSerializer, UserProfileSerializer, LoginSerializer,
    SkillSerializer, SkillCategorySerializer, UserSkillSerializer,
    SwapRequestSerializer, MeetingSerializer, LearningMaterialSerializer,
    RatingSerializer, NotificationSerializer, AdminMessageSerializer,
    ChatSerializer, ChatMessageSerializer
)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserProfileSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        login(request, user)
        return Response({
            'user': UserProfileSerializer(user).data,
            'token': token.key
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully'})
    except:
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)

# Profile Views
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'location']
    filterset_fields = ['location', 'is_public']

    def get_queryset(self):
        return User.objects.filter(is_public=True, is_active=True, is_banned=False)

# Skill Category Views
class SkillCategoryListView(generics.ListCreateAPIView):
    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

# Skill Views
class SkillListView(generics.ListCreateAPIView):
    queryset = Skill.objects.filter(is_approved=True)
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'description']
    filterset_fields = ['category']

# User Skill Views
class UserSkillListView(generics.ListCreateAPIView):
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['skill__name', 'description']
    filterset_fields = ['skill_type', 'proficiency_level', 'skill__category']

    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user, is_active=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserSkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)

class PublicSkillSearchView(generics.ListAPIView):
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['skill__name', 'description', 'user__username', 'user__location']
    filterset_fields = ['skill_type', 'proficiency_level', 'skill__category']

    def get_queryset(self):
        return UserSkill.objects.filter(
            user__is_public=True,
            user__is_active=True,
            user__is_banned=False,
            is_active=True
        ).exclude(user=self.request.user)

# Swap Request Views
class SwapRequestListView(generics.ListCreateAPIView):
    serializer_class = SwapRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

    def get_queryset(self):
        return SwapRequest.objects.filter(
            Q(requester=self.request.user) | Q(receiver=self.request.user)
        ).order_by('-created_at')

class SwapRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SwapRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SwapRequest.objects.filter(
            Q(requester=self.request.user) | Q(receiver=self.request.user)
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_swap_request(request, swap_id):
    swap_request = get_object_or_404(SwapRequest, id=swap_id, receiver=request.user)
    if swap_request.status == 'pending':
        swap_request.status = 'accepted'
        swap_request.save()
        
        # Create notification
        Notification.objects.create(
            user=swap_request.requester,
            notification_type='swap_accepted',
            title='Swap Request Accepted',
            message=f'{request.user.username} accepted your swap request'
        )
        
        # Create chat
        Chat.objects.get_or_create(swap_request=swap_request)
        
        return Response({'message': 'Swap request accepted'})
    return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_swap_request(request, swap_id):
    swap_request = get_object_or_404(SwapRequest, id=swap_id, receiver=request.user)
    if swap_request.status == 'pending':
        swap_request.status = 'rejected'
        swap_request.save()
        
        # Create notification
        Notification.objects.create(
            user=swap_request.requester,
            notification_type='swap_rejected',
            title='Swap Request Rejected',
            message=f'{request.user.username} rejected your swap request'
        )
        
        return Response({'message': 'Swap request rejected'})
    return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

# Meeting Views
class MeetingListView(generics.ListCreateAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Meeting.objects.filter(
            Q(swap_request__requester=self.request.user) | 
            Q(swap_request__receiver=self.request.user)
        ).order_by('scheduled_time')

class MeetingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Meeting.objects.filter(
            Q(swap_request__requester=self.request.user) | 
            Q(swap_request__receiver=self.request.user)
        )

# Learning Material Views
class LearningMaterialListView(generics.ListCreateAPIView):
    serializer_class = LearningMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['title', 'description', 'skill__name']
    filterset_fields = ['material_type', 'skill', 'is_public']

    def get_queryset(self):
        return LearningMaterial.objects.filter(
            Q(is_public=True) | Q(uploader=self.request.user)
        ).order_by('-created_at')

class LearningMaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LearningMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LearningMaterial.objects.filter(
            Q(is_public=True) | Q(uploader=self.request.user)
        )

# Rating Views
class RatingListView(generics.ListCreateAPIView):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Rating.objects.filter(
            Q(rater=self.request.user) | Q(rated_user=self.request.user)
        ).order_by('-created_at')

class RatingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Rating.objects.filter(rater=self.request.user)

# Notification Views
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.is_read = True
    notification.save()
    return Response({'message': 'Notification marked as read'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read'})

# Chat Views
class ChatListView(generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Chat.objects.filter(
            Q(swap_request__requester=self.request.user) | 
            Q(swap_request__receiver=self.request.user)
        ).order_by('-created_at')

class ChatDetailView(generics.RetrieveAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(
            Q(swap_request__requester=self.request.user) | 
            Q(swap_request__receiver=self.request.user)
        )

class ChatMessageListView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        chat_id = self.kwargs.get('chat_id')
        chat = get_object_or_404(Chat, id=chat_id)
        
        # Check if user has access to this chat
        if (chat.swap_request.requester != self.request.user and 
            chat.swap_request.receiver != self.request.user):
            return ChatMessage.objects.none()
        
        return ChatMessage.objects.filter(chat=chat).order_by('-created_at')

    def perform_create(self, serializer):
        chat_id = self.kwargs.get('chat_id')
        chat = get_object_or_404(Chat, id=chat_id)
        
        # Check if user has access to this chat
        if (chat.swap_request.requester != self.request.user and 
            chat.swap_request.receiver != self.request.user):
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer.save(chat=chat, sender=self.request.user)

# Admin Views
class AdminMessageListView(generics.ListCreateAPIView):
    serializer_class = AdminMessageSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return AdminMessage.objects.filter(is_active=True).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(admin=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    
    # User stats
    total_skills_offered = UserSkill.objects.filter(user=user, skill_type='offer', is_active=True).count()
    total_skills_requested = UserSkill.objects.filter(user=user, skill_type='request', is_active=True).count()
    
    # Swap stats
    pending_requests_sent = SwapRequest.objects.filter(requester=user, status='pending').count()
    pending_requests_received = SwapRequest.objects.filter(receiver=user, status='pending').count()
    completed_swaps = SwapRequest.objects.filter(
        Q(requester=user) | Q(receiver=user), status='completed'
    ).count()
    
    # Rating stats
    average_rating = Rating.objects.filter(rated_user=user).aggregate(
        avg_rating=Avg('rating')
    )['avg_rating'] or 0
    
    # Meeting stats
    upcoming_meetings = Meeting.objects.filter(
        Q(swap_request__requester=user) | Q(swap_request__receiver=user),
        status='scheduled',
        scheduled_time__gte=timezone.now()
    ).count()
    
    # Notification stats
    unread_notifications = Notification.objects.filter(user=user, is_read=False).count()
    
    return Response({
        'total_skills_offered': total_skills_offered,
        'total_skills_requested': total_skills_requested,
        'pending_requests_sent': pending_requests_sent,
        'pending_requests_received': pending_requests_received,
        'completed_swaps': completed_swaps,
        'average_rating': round(average_rating, 1),
        'upcoming_meetings': upcoming_meetings,
        'unread_notifications': unread_notifications,
    })

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_dashboard_stats(request):
    # Admin dashboard statistics
    total_users = User.objects.filter(is_active=True).count()
    banned_users = User.objects.filter(is_banned=True).count()
    total_skills = Skill.objects.count()
    pending_skills = Skill.objects.filter(is_approved=False).count()
    
    total_swaps = SwapRequest.objects.count()
    pending_swaps = SwapRequest.objects.filter(status='pending').count()
    completed_swaps = SwapRequest.objects.filter(status='completed').count()
    
    total_meetings = Meeting.objects.count()
    upcoming_meetings = Meeting.objects.filter(
        status='scheduled',
        scheduled_time__gte=timezone.now()
    ).count()
    
    total_materials = LearningMaterial.objects.count()
    total_ratings = Rating.objects.count()
    average_platform_rating = Rating.objects.aggregate(
        avg_rating=Avg('rating')
    )['avg_rating'] or 0
    
    return Response({
        'total_users': total_users,
        'banned_users': banned_users,
        'total_skills': total_skills,
        'pending_skills': pending_skills,
        'total_swaps': total_swaps,
        'pending_swaps': pending_swaps,
        'completed_swaps': completed_swaps,
        'total_meetings': total_meetings,
        'upcoming_meetings': upcoming_meetings,
        'total_materials': total_materials,
        'total_ratings': total_ratings,
        'average_platform_rating': round(average_platform_rating, 1),
    })

# Search and Filter Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_users_by_skill(request):
    skill_name = request.GET.get('skill', '')
    skill_type = request.GET.get('type', 'offer')  # offer or request
    
    if not skill_name:
        return Response({'error': 'Skill parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user_skills = UserSkill.objects.filter(
        skill__name__icontains=skill_name,
        skill_type=skill_type,
        is_active=True,
        user__is_public=True,
        user__is_active=True,
        user__is_banned=False
    ).exclude(user=request.user)
    
    serializer = UserSkillSerializer(user_skills, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def skill_recommendations(request):
    # Get user's offered skills
    user_offered_skills = UserSkill.objects.filter(
        user=request.user,
        skill_type='offer',
        is_active=True
    ).values_list('skill__id', flat=True)
    
    # Find users who request these skills
    potential_matches = UserSkill.objects.filter(
        skill__id__in=user_offered_skills,
        skill_type='request',
        is_active=True,
        user__is_public=True,
        user__is_active=True,
        user__is_banned=False
    ).exclude(user=request.user)
    
    serializer = UserSkillSerializer(potential_matches, many=True)
    return Response(serializer.data)