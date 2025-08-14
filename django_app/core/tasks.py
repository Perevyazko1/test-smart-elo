from celery import shared_task

from src.ms_import.ms_import import import_ms


@shared_task(name="import_orders")
def import_orders():
    import_ms()

