"""Initial methods and scripts."""
from .reports.constructing import constructing_report


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    constructing_report()

    return "Oki"
