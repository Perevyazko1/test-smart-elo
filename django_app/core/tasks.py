from celery import shared_task

from core.api_moy_sklad.services.import_orders import ImportOrders


@shared_task(name="import_orders")
def import_orders():
    ImportOrders().execute()
