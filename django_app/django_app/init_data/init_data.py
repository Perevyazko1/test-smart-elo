"""Initial methods and scripts. """
from django_celery_beat.models import PeriodicTask, PeriodicTasks, now


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    PeriodicTask.objects.update(last_run_at=None)
    PeriodicTasks.update_changed()
