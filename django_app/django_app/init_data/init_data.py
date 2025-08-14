"""Initial methods and scripts."""
from src.ms_import.ms_import import import_ms


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    import_ms()
    print('PASS')
    return f"Oki"
