# Generated by Django 4.2.7 on 2025-07-12 07:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_chat_message'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='swaprequest',
            options={'ordering': ['-created_at']},
        ),
        migrations.AlterUniqueTogether(
            name='swaprequest',
            unique_together=set(),
        ),
    ]
