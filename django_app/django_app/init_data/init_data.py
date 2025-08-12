"""Initial methods and scripts."""
from core.models import Assignment
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
    ).exclude(
        status="ready"
    )

    for assignment in target_assignments:
        co_executors = assignment.co_executors.all()
        if co_executors.exists():
            amount = 0
            for co_executor in co_executors:
                amount += co_executor.wages_amount

            assignment.amount = assignment.new_tariff.amount - amount
            assignment.save()
            print("ИСПРАВЛЕНО")
        else:
            if not assignment.amount == assignment.new_tariff.amount:
                assignment.amount = assignment.new_tariff.amount
                assignment.save()
                print("ИСПРАВЛЕНО")

    print(target_assignments.count())
    print('PASS')
    return f"Oki"
