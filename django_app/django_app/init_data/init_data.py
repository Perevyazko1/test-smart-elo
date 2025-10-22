"""Initial methods and scripts."""
import logging

from django_app.init_data.reports.constructing import constructing_report

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    constructing_report()

    print('PASS')
    return f"Oki"
