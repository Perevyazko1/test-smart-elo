from rest_framework import viewsets
from core.models import Assignment
from .filters import AssignmentModelFilter
from .serializers import AssignmentExtendedSerializer


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    filterset_class = AssignmentModelFilter
    serializer_class = AssignmentExtendedSerializer
