"""Initial methods and scripts. """
from tasks.models import Task
from django.contrib.auth.models import Group


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    tasks = Task.objects.all()

    for task in tasks:
        if task.for_department:
            task.for_departments.add(task.for_department)
