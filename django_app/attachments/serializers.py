from rest_framework import serializers
from .models import Attachment


class AttachmentSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.get_full_name')

    class Meta:
        model = Attachment
        fields = [
            'id', 'type', 'file', 'text',
            'content_type', 'object_id', 
            'author', 'author_name', 'created_at', 'is_active', 'department'
        ]
        read_only_fields = ['author', 'created_at']

    def create(self, validated_data):
        # Автоматически устанавливаем автора из запроса
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['author'] = request.user
            validated_data['department'] = request.user.current_department
        return super().create(validated_data)
