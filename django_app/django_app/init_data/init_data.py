"""Initial methods and scripts. """
from tasks.models import Task, TaskExecutor
from django_celery_beat.models import PeriodicTask, PeriodicTasks


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    PeriodicTask.objects.update(last_run_at=None)
    PeriodicTasks.objects.changed()
