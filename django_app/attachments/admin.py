from django.contrib import admin
from .models import Attachment


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'author', 'created_at', 'is_active', 'content_type', 'object_id')
    list_filter = ('type', 'is_active', 'created_at')
    search_fields = ('text', 'author__username', 'author__first_name', 'author__last_name')
    readonly_fields = ('created_at',)
