"""Initial methods and scripts."""
from .upholstery_report import upholstery_report


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    upholstery_report()
    return "Oki"
