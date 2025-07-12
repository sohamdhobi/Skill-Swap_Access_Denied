from django.contrib.auth.models import AbstractUser
from django.db import models


class UserProfile(AbstractUser):
    location = models.CharField(max_length=100, blank=True, null=True)
    photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    is_public = models.BooleanField(default=True)
    
    def __str__(self):
        return self.username


class Skill(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='skills')
    offered = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.owner.username}"
    
    class Meta:
        unique_together = ['name', 'owner']


class SwapRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    from_user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sent_requests')
    to_user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='received_requests')
    offered_skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='offered_in_swaps')
    requested_skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='requested_in_swaps')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username}: {self.offered_skill.name} for {self.requested_skill.name}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        if self.from_user == self.to_user:
            raise ValidationError("You cannot create a swap request with yourself.")
        if self.offered_skill.owner != self.from_user:
            raise ValidationError("You can only offer your own skills.")
        if self.requested_skill.owner != self.to_user:
            raise ValidationError("You can only request skills from their owner.")
    
    class Meta:
        # Remove the overly restrictive unique constraint
        # Allow multiple requests between the same users with different skills
        ordering = ['-created_at']


class Chat(models.Model):
    swap_request = models.OneToOneField(SwapRequest, on_delete=models.CASCADE, related_name='chat', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Chat for Swap: {self.swap_request}"
    
    @property
    def participants(self):
        return [self.swap_request.from_user, self.swap_request.to_user]


class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}..."
    
    class Meta:
        ordering = ['created_at']


class Meeting(models.Model):
    MEETING_TYPE_CHOICES = [
        ('INSTANT', 'Instant Meeting'),
        ('SCHEDULED', 'Scheduled Meeting'),
    ]
    
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('ONGOING', 'Ongoing'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='meetings')
    organizer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='organized_meetings')
    meeting_type = models.CharField(max_length=20, choices=MEETING_TYPE_CHOICES, default='INSTANT')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=30)
    meeting_url = models.URLField(blank=True, null=True)
    meeting_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.organizer.username}"
    
    @property
    def participants(self):
        return self.chat.participants
    
    class Meta:
        ordering = ['-created_at']
