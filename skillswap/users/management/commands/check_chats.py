from django.core.management.base import BaseCommand
from users.models import SwapRequest, Chat, UserProfile

class Command(BaseCommand):
    help = 'Check the state of swap requests and chats in the database'

    def handle(self, *args, **options):
        self.stdout.write('=== Database State Check ===')
        
        # Check users
        users = UserProfile.objects.all()
        self.stdout.write(f'\nUsers ({users.count()}):')
        for user in users:
            self.stdout.write(f'  - {user.username}')
        
        # Check swap requests
        swaps = SwapRequest.objects.all()
        self.stdout.write(f'\nSwap Requests ({swaps.count()}):')
        for swap in swaps:
            self.stdout.write(f'  - ID: {swap.id}, Status: {swap.status}')
            self.stdout.write(f'    From: {swap.from_user.username} -> To: {swap.to_user.username}')
            self.stdout.write(f'    Offered: {swap.offered_skill.name} -> Requested: {swap.requested_skill.name}')
        
        # Check chats
        chats = Chat.objects.all()
        self.stdout.write(f'\nChats ({chats.count()}):')
        for chat in chats:
            self.stdout.write(f'  - ID: {chat.id}, Swap Request: {chat.swap_request.id}')
            self.stdout.write(f'    Participants: {[p.username for p in chat.participants]}')
        
        # Check accepted swaps without chats
        accepted_swaps = SwapRequest.objects.filter(status='ACCEPTED')
        accepted_without_chat = []
        for swap in accepted_swaps:
            if not hasattr(swap, 'chat'):
                accepted_without_chat.append(swap)
        
        if accepted_without_chat:
            self.stdout.write(f'\n⚠️  Accepted swaps without chats ({len(accepted_without_chat)}):')
            for swap in accepted_without_chat:
                self.stdout.write(f'  - Swap ID: {swap.id}')
        else:
            self.stdout.write('\n✅ All accepted swaps have chats')
        
        self.stdout.write('\n=== End Check ===') 