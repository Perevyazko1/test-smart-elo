"""Initial methods and scripts. """
from staff.models import Employee
from django.contrib.auth.models import Group


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    users = Employee.objects.all().filter(
        is_active=True
    )

    target_group = Group.objects.get(name='Страница задач')

    for user in users:
        user.groups.add(target_group)
