"""Initial methods and scripts."""
import logging

from src.ms_import.ms_import import import_ms

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    import_ms()

    print('PASS')
    return f"Oki"
