from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import UserProfile, Skill, SwapRequest, Chat, Message, Meeting
from .serializers import (
    UserProfileSerializer, SkillSerializer, SwapRequestSerializer,
    UserRegistrationSerializer, ChatSerializer, MessageSerializer, MeetingSerializer
)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.action == 'list':
            return UserProfile.objects.filter(is_public=True)
        return UserProfile.objects.all()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Skill.objects.all()
        
        # Filter by name
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(name__icontains=name)
        
        # Filter by owner
        owner = self.request.query_params.get('owner', None)
        if owner:
            queryset = queryset.filter(owner__username=owner)
        
        # Filter by availability
        offered = self.request.query_params.get('offered', None)
        if offered is not None:
            queryset = queryset.filter(offered=offered.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        print(f"Skill creation errors: {serializer.errors}")  # Debug print
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SwapRequestViewSet(viewsets.ModelViewSet):
    queryset = SwapRequest.objects.all()
    serializer_class = SwapRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return SwapRequest.objects.filter(
            Q(from_user=user) | Q(to_user=user)
        )
    
    def perform_create(self, serializer):
        serializer.save(from_user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Check if a similar swap request already exists
            existing_request = SwapRequest.objects.filter(
                from_user=request.user,
                to_user=serializer.validated_data['to_user'],
                offered_skill=serializer.validated_data['offered_skill'],
                requested_skill=serializer.validated_data['requested_skill']
            ).first()
            
            if existing_request:
                return Response(
                    {'error': 'A swap request with these skills already exists.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                serializer.save(from_user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'error': 'Failed to create swap request. Please try again.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        swap_request = self.get_object()
        
        if swap_request.to_user != request.user:
            return Response(
                {'error': 'You can only accept requests sent to you'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            swap_request.status = 'ACCEPTED'
            swap_request.save()
            
            # Create a chat for the accepted swap
            chat, created = Chat.objects.get_or_create(swap_request=swap_request)
            
            return Response({'status': 'accepted', 'chat_id': chat.id})
        except Exception as e:
            return Response(
                {'error': 'Failed to accept swap request. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        swap_request = self.get_object()
        if swap_request.to_user != request.user:
            return Response(
                {'error': 'You can only reject requests sent to you'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        swap_request.status = 'REJECTED'
        swap_request.save()
        return Response({'status': 'rejected'})
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        swap_request = self.get_object()
        if swap_request.from_user != request.user:
            return Response(
                {'error': 'You can only cancel requests you sent'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        swap_request.status = 'CANCELLED'
        swap_request.save()
        return Response({'status': 'cancelled'})


class RegisterView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'username': user.username
            })
        print(f"Registration errors: {serializer.errors}")  # Debug print
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user_id': user.pk,
                    'username': user.username
                })
        
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        chats = Chat.objects.filter(
            Q(swap_request__from_user=user) | Q(swap_request__to_user=user)
        ).filter(swap_request__status='ACCEPTED')
        return chats
    
    def perform_create(self, serializer):
        # Chat is automatically created when swap is accepted
        pass


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        chat_id = self.request.query_params.get('chat_id')
        if chat_id:
            return Message.objects.filter(chat_id=chat_id)
        return Message.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Check if user is part of the chat
            chat = serializer.validated_data.get('chat')
            if chat and (request.user in chat.participants):
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                return Response(
                    {'error': 'You are not authorized to send messages in this chat'},
                    status=status.HTTP_403_FORBIDDEN
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Meeting.objects.filter(
            Q(chat__swap_request__from_user=user) | Q(chat__swap_request__to_user=user)
        )
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Check if user is part of the chat
            chat = serializer.validated_data.get('chat')
            if chat and (request.user in chat.participants):
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                return Response(
                    {'error': 'You are not authorized to create meetings in this chat'},
                    status=status.HTTP_403_FORBIDDEN
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        meeting = self.get_object()
        if meeting.organizer != request.user:
            return Response(
                {'error': 'Only the organizer can start the meeting'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        meeting.status = 'ONGOING'
        meeting.save()
        
        # Send notification to other participants
        other_participants = [p for p in meeting.participants if p != request.user]
        for participant in other_participants:
            # Create a notification message
            message = Message.objects.create(
                chat=meeting.chat,
                sender=request.user,
                content=f"🚀 {request.user.username} started the meeting: {meeting.title}"
            )
        
        return Response({
            'status': 'started',
            'message': f'Meeting started. Notified {len(other_participants)} participants.'
        })
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        meeting = self.get_object()
        if request.user not in meeting.participants:
            return Response(
                {'error': 'You are not authorized to join this meeting'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response({
            'meeting_url': meeting.meeting_url,
            'meeting_id': meeting.meeting_id,
            'status': meeting.status
        })
    
    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        meeting = self.get_object()
        if meeting.organizer != request.user:
            return Response(
                {'error': 'Only the organizer can end the meeting'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        meeting.status = 'COMPLETED'
        meeting.save()
        return Response({'status': 'ended'})
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        meeting = self.get_object()
        if meeting.organizer != request.user:
            return Response(
                {'error': 'Only the organizer can cancel the meeting'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        meeting.status = 'CANCELLED'
        meeting.save()
        return Response({'status': 'cancelled'})
