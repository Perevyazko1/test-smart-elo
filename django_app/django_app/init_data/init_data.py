"""Initial methods and scripts."""
import logging

from django_app.init_data.reports.finance import get_finance_report

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    get_finance_report()

    print('PASS')
    return f"Oki"
