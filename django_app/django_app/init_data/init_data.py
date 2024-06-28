"""Initial methods and scripts. """
from staff.models import Employee


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    users = Employee.objects.all().filter(
        is_active=True
    )

    for user in users:
        user.permanent_department = user.current_department
        user.save()
