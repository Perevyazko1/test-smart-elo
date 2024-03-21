from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view

from core.models import Assignment, ProductionStep
from staff.models import Audit, Employee
from staff.service import is_user_in_group
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
