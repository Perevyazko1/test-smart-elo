from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Attachment
from .serializers import AttachmentSerializer


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all().order_by('-created_at')
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['type', 'content_type', 'object_id', 'is_active']
