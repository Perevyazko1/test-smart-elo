"""Initial methods and scripts. """
from tasks.models import Task


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    tasks = Task.objects.all()

    for task in tasks:
        task.created_by = task.appointed_by
        task.appointed_by = None
        task.save()
