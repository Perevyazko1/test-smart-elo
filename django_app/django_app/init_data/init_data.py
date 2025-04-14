"""Initial methods and scripts."""
from .fix_status import fix_status


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    fix_status()
    return "Oki"
