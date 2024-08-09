from django.db.models import Sum
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view

from core.models import Assignment, AssignmentCoExecutor
from staff.models import Employee
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


@api_view(['POST'])
def update_co_executor(request):
    action = request.data.get('action')
    co_executor_ids = request.data.get('co_executor_ids')
    assignment_ids = request.data.get('assignment_ids')
    data = request.data.get('data')

    if action == 'delete':
        AssignmentCoExecutor.objects.filter(
            id__in=co_executor_ids
        ).delete()
    if action == 'update_or_create':
        for assignment_id in assignment_ids:
            target_assignment = Assignment.objects.get(id=assignment_id)
            new_amount = 0
            if target_assignment.new_tariff:
                current_amount = AssignmentCoExecutor.objects.filter(
                    assignment=assignment_id,
                ).exclude(
                    co_executor=data.get('co_executor__id')
                ).aggregate(total=Sum('amount'))['total'] or 0
                new_amount = data.get('amount')
                current_difference = target_assignment.new_tariff.amount - current_amount

                if current_difference <= new_amount:
                    new_amount = current_difference
            AssignmentCoExecutor.objects.update_or_create(
                co_executor=Employee.objects.get(id=data.get('co_executor__id')),
                assignment=target_assignment,
                defaults={
                    'amount': new_amount
                }
            )

    return JsonResponse({"result": 'ok'}, json_dumps_params={"ensure_ascii": False})
