"""Initial methods and scripts."""
from django_app.init_data.reports.production_debt import production_debt


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    production_debt()
    return "Oki"
