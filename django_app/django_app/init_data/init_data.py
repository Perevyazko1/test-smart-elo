"""Initial methods and scripts. """
from staff.models import Employee


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    for user in Employee.objects.all():
        user.current_balance = 0
        user.save()

    return 'pass'
