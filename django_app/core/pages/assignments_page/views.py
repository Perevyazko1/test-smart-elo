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


@api_view(['POST'])
def update_assignments(request):
    assignments_id: list[int] = request.data.get('id_list')
    action: list[int] = request.data.get('action')
    pin_code = request.data.get('pin_code')

    employee = Employee.objects.get(pin_code=pin_code)

    if not is_user_in_group(employee, 'Снятие визы'):
        return JsonResponse({
            f'error': f'Ошибка доступа. У пользователя нет прав на снятие визы с нарядов.'
        }, status=401, json_dumps_params={"ensure_ascii": False})

    match action:
        case 'remove_confirmation':
            for assignment_id in assignments_id:
                assignment = Assignment.objects.get(id=assignment_id)

                if assignment.inspector is None:
                    return JsonResponse({
                        f'error': f'Ошибка. Наряд №{assignment.number} '
                                  f'серии {assignment.order_product.series_id} не содержит визы бригадира. '
                    }, status=400, json_dumps_params={"ensure_ascii": False})

                production_step: ProductionStep = ProductionStep.objects.get(
                    department=assignment.department,
                    product=assignment.order_product.product,
                )
                if production_step.department.single:
                    assignments = Assignment.objects.filter(
                        order_product=assignment.order_product
                    ).exclude(id=assignment_id)

                    count_all = assignments.count()
                    count_await = assignments.filter(
                        status__in=['await', 'created'],
                    ).count()

                    if count_await < count_all:
                        return JsonResponse({
                            f'error': f'Ошибка. В других отделах есть наряды в статусах "В работе" и "Готов". '
                                      f'Устраните несоответствие или обратитесь к администратору.'
                        }, status=400, json_dumps_params={"ensure_ascii": False})
                    else:
                        assignments.delete()

                else:
                    first_next_production_step = production_step.next_step.first()
                    confirm_assignments_count = Assignment.objects.filter(
                        department=assignment.department,
                        order_product=assignment.order_product,
                        inspector__isnull=False
                    ).count()
                    next_production_step_count = Assignment.objects.filter(
                        department=first_next_production_step.department,
                        order_product=assignment.order_product,
                    ).count()

                    if not next_production_step_count < confirm_assignments_count:
                        for next_production_step in production_step.next_step.all():
                            target_assignment = Assignment.objects.filter(
                                order_product=assignment.order_product,
                                department=next_production_step.department,
                            ).latest('number')

                            if target_assignment.status == 'await':
                                target_assignment.delete()
                            else:
                                return JsonResponse({
                                    f'error': f'Ошибка. В отделе {target_assignment.department.name} '
                                              f'наряд №{target_assignment.number} '
                                              f'серии {target_assignment.order_product.series_id} уже назначен. '
                                              f'Для снятия визы наряды последующего отдела должны быть в статусе '
                                              f'Ожидает.'
                                }, status=400, json_dumps_params={"ensure_ascii": False})

                assignment.inspector = None
                assignment.save()
                Audit.objects.create(
                    employee=employee,
                    details=f"Снял визирование с наряда № {assignment.number} "
                            f"серии {assignment.order_product.series_id} "
                            f"отдела {assignment.department.name}"
                )
                continue

            return JsonResponse({'result': 'ok'}, status=200, json_dumps_params={"ensure_ascii": False})

        case _:
            return JsonResponse({
                'error': 'Ошибка запроса. Не корректная команда'
            }, status=400, json_dumps_params={"ensure_ascii": False})
