"""Initial methods and scripts. """
from tasks.models import Task, TaskExecutor


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    all_tasks = Task.objects.all()

    for task in all_tasks:
        if task.co_executors:
            co_executors = task.co_executors.all()
            for co_executor in co_executors:
                new_co_executor, created = TaskExecutor.objects.get_or_create(
                    employee=co_executor,
                    amount=0,
                    task=task,
                )
                task.new_co_executors.add(new_co_executor)
        if task.executor:
            new_executor, created = TaskExecutor.objects.get_or_create(
                employee=task.executor,
                amount=0,
                task=task,
            )
            task.new_executor = new_executor

        task.save()
