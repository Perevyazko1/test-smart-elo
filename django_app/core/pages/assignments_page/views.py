from django.db.models import Sum
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view

from core.models import Assignment, AssignmentCoExecutor
from staff.models import Employee
from .filters import AssignmentModelFilter
from .serializers import AssignmentExtendedSerializer
from ...consumers import EqNotificationActions, ws_group_updates
from ...signals import clean_all_eq_card_info_cache


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
        department = None
        order_product = None

        for assignment_id in assignment_ids:
            target_assignment = Assignment.objects.get(id=assignment_id)
            department = target_assignment.department
            order_product = target_assignment.order_product
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

            co_executor = Employee.objects.get(id=data.get('co_executor__id'))
            if co_executor.piecework_wages:
                AssignmentCoExecutor.objects.update_or_create(
                    co_executor=co_executor,
                    assignment=target_assignment,
                    defaults={
                        'amount': new_amount,
                    }
                )
            else:
                AssignmentCoExecutor.objects.update_or_create(
                    co_executor=co_executor,
                    assignment=target_assignment,
                    defaults={
                        'amount': 0,
                    }
                )

        clean_all_eq_card_info_cache(order_product.id, department.id)

        notification_data = {department.number: {
            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
            'data': order_product.id,
        }}
        ws_group_updates(pin_code="", notification_data=notification_data)

    return JsonResponse({"result": 'ok'}, json_dumps_params={"ensure_ascii": False})
