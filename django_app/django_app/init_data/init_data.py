"""Initial methods and scripts. """
from django.db.models import Sum

from core.models import Assignment, AssignmentCoExecutor
from staff.models import Department


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    target_departments = Department.objects.filter(
        piecework_wages=True
    )

    target_assignments = Assignment.objects.filter(
        department__in=target_departments,
        new_tariff__isnull=False,
    )

    for assignment in target_assignments:
        all_co_executors_sum = AssignmentCoExecutor.objects.filter(
            assignment=assignment
        ).aggregate(Sum('amount')).get('amount__sum') or 0

        assignment.amount = assignment.new_tariff.amount - all_co_executors_sum
        assignment.save()
