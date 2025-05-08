"""Initial methods and scripts."""
from core.models import ProductionStep
from staff.models import Department


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    for ps in ProductionStep.objects.all():
        next_ps = ps.next_step.all()
        next_departments = Department.objects.filter(productionstep__in=next_ps)

        for department in next_departments:
            ps.next_steps.add(department.id)
        ps.save()
    print('PASS')
    return "Oki"
