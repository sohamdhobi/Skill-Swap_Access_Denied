from django.db import models
from django.contrib.auth.models import AbstractUser

class UserProfile(AbstractUser):
    location = models.CharField(max_length=255, blank=True, null=True)
    photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    is_public = models.BooleanField(default=True)

class Skill(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='skills')
    offered = models.BooleanField(default=False)

class SwapRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
    ]
    from_user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sent_requests')
    to_user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='received_requests')
    offered_skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='offered_requests')
    requested_skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='requested_requests')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
