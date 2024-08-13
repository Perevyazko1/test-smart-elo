"""Initial methods and scripts. """
from staff.models import Employee

from tasks.models import TaskComment, Task


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    target_tasks = Task.objects.all()

    for task in target_tasks:
        if task.execution_comment:
            TaskComment.objects.create(
                author=Employee.objects.get(id=1),
                task=task,
                comment=task.execution_comment,
            )
            task.execution_comment = ""
            task.save()
