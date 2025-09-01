from celery import shared_task

from django_app.init_data.init_data import init_data
from src.ms_import.ms_import import import_ms


@shared_task(name="import_orders")
def import_orders():
    import_ms()


@shared_task(name="init")
def init():
    init_data()

