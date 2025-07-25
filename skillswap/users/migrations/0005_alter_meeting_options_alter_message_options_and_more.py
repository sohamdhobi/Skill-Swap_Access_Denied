# Generated by Django 4.2.7 on 2025-07-12 10:11

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_meeting'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='meeting',
            options={},
        ),
        migrations.AlterModelOptions(
            name='message',
            options={},
        ),
        migrations.AlterModelOptions(
            name='swaprequest',
            options={},
        ),
        migrations.AlterUniqueTogether(
            name='skill',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='chat',
            name='swap_request',
        ),
        migrations.RemoveField(
            model_name='meeting',
            name='meeting_id',
        ),
        migrations.RemoveField(
            model_name='meeting',
            name='meeting_type',
        ),
        migrations.RemoveField(
            model_name='meeting',
            name='meeting_url',
        ),
        migrations.RemoveField(
            model_name='meeting',
            name='scheduled_at',
        ),
        migrations.RemoveField(
            model_name='message',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='swaprequest',
            name='offered_skill',
        ),
        migrations.RemoveField(
            model_name='swaprequest',
            name='requested_skill',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='is_public',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='location',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='photo',
        ),
        migrations.AddField(
            model_name='chat',
            name='participants',
            field=models.ManyToManyField(related_name='chats', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='meeting',
            name='scheduled_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='skill',
            name='description',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='swaprequest',
            name='from_skill',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='swap_requests_from', to='users.skill'),
        ),
        migrations.AddField(
            model_name='swaprequest',
            name='message',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='swaprequest',
            name='to_skill',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='swap_requests_to', to='users.skill'),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='bio',
            field=models.TextField(blank=True, max_length=500),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='description',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='message',
            name='sender',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='skill',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owned_skills', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='swaprequest',
            name='status',
            field=models.CharField(choices=[('PENDING', 'Pending'), ('ACCEPTED', 'Accepted'), ('REJECTED', 'Rejected'), ('COMPLETED', 'Completed')], default='PENDING', max_length=20),
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('MEETING_STARTED', 'Meeting Started'), ('MEETING_REMINDER', 'Meeting Reminder'), ('MEETING_ENDED', 'Meeting Ended'), ('SWAP_REQUEST', 'Swap Request'), ('SWAP_ACCEPTED', 'Swap Accepted'), ('SWAP_REJECTED', 'Swap Rejected')], max_length=20)),
                ('title', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
                ('related_meeting', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='users.meeting')),
                ('related_swap_request', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='users.swaprequest')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.RemoveField(
            model_name='skill',
            name='offered',
        ),
    ]
