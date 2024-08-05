from rest_framework import viewsets

from core.models import Assignment, AssignmentCoExecutor
from .filters import AssignmentModelFilter
from .serializers import AssignmentExtendedSerializer


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    filterset_class = AssignmentModelFilter
    serializer_class = AssignmentExtendedSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.filter(
            department__in=self.request.user.departments.all()
        )

        return qs


class AssignmentCoExecutorViewSet(viewsets.ModelViewSet):
    queryset = AssignmentCoExecutor.objects.all()
    serializer_class = AssignmentExtendedSerializer
