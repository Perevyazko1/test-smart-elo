"""Initial methods and scripts. """
from core.models import Assignment, AssignmentCoExecutor
from core.services.assignment_generator import AssignmentGenerator


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    target_assignments = Assignment.objects.filter(
        status='in_work',
        department__piecework_wages=True,
    )
    for assignment in target_assignments:
        if assignment.new_tariff:
            if AssignmentCoExecutor.objects.filter(
                assignment=assignment
            ).exists():
                continue
            else:
                assignment.amount = assignment.new_tariff.amount
                assignment.save()
