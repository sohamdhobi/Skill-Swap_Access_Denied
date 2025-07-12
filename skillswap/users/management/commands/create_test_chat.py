from django.core.management.base import BaseCommand
from users.models import SwapRequest, Chat, UserProfile

class Command(BaseCommand):
    help = 'Create a test chat for debugging'

    def handle(self, *args, **options):
        self.stdout.write('=== Creating Test Chat ===')
        
        # Get all users
        users = UserProfile.objects.all()
        if users.count() < 2:
            self.stdout.write('❌ Need at least 2 users to create a test chat')
            return
        
        user1 = users.first()
        user2 = users.last()
        
        self.stdout.write(f'Using users: {user1.username} and {user2.username}')
        
        # Check if there are any swap requests
        swaps = SwapRequest.objects.all()
        if swaps.count() == 0:
            self.stdout.write('❌ No swap requests found. Please create some swap requests first.')
            return
        
        # Find an accepted swap or create one
        accepted_swap = SwapRequest.objects.filter(status='ACCEPTED').first()
        if not accepted_swap:
            # Accept the first pending swap
            pending_swap = SwapRequest.objects.filter(status='PENDING').first()
            if pending_swap:
                self.stdout.write(f'Accepting swap {pending_swap.id}')
                pending_swap.status = 'ACCEPTED'
                pending_swap.save()
                accepted_swap = pending_swap
            else:
                self.stdout.write('❌ No pending or accepted swaps found')
                return
        
        # Create chat for the accepted swap
        chat, created = Chat.objects.get_or_create(swap_request=accepted_swap)
        
        if created:
            self.stdout.write(f'✅ Created chat {chat.id} for swap {accepted_swap.id}')
        else:
            self.stdout.write(f'ℹ️  Chat {chat.id} already exists for swap {accepted_swap.id}')
        
        self.stdout.write(f'Chat participants: {[p.username for p in chat.participants]}')
        self.stdout.write('=== Test Chat Created ===') 