"""Initial methods and scripts. """
from datetime import datetime, timedelta

from core.models import AssignmentCoExecutor, Assignment
from staff.models import Department


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    # TODO скрипт задать wages_amount для всех соисполнителей за последний месяц
    target_co_executors = AssignmentCoExecutor.objects.all()
    for co_executor in target_co_executors:
        co_executor.wages_amount = co_executor.amount
        co_executor.save()

    # TODO скрипт за последний месяц пересчитать наряды по сдельщикам которые были на окладе
    today = datetime.now()
    target_month = today - timedelta(days=30)
    target_departments = Department.objects.filter(piecework_wages=True)

    target_assignments = Assignment.objects.filter(
        date_completion__gt=target_month,
        department__in=target_departments,
        amount=0,
        new_tariff__isnull=False,
    )

    for assignment in target_assignments:
        if assignment.executor.piecework_wages:
            co_executors = AssignmentCoExecutor.objects.filter(
                assignment=assignment
            )
            difference = 0
            for co_executor in co_executors:
                difference += co_executor.amount
            assignment.amount = assignment.new_tariff.amount - difference
            assignment.save()

    return 'pass'
