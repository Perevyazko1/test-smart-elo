from celery import shared_task
from datetime import datetime, timedelta
from easyaudit.models import CRUDEvent, LoginEvent, RequestEvent

from django_app.init_data.init_data import init_data
from src.ms_import.ms_import import import_ms


@shared_task(name="import_orders")
def import_orders():
    import_ms()


@shared_task(name="init")
def init():
    init_data()


@shared_task(name="clear_audit")
def clear_audit():
    month_ago = datetime.now() - timedelta(days=30)

    CRUDEvent.objects.filter(datetime__lt=month_ago).delete()
    LoginEvent.objects.filter(datetime__lt=month_ago).delete()
    RequestEvent.objects.filter(datetime__lt=month_ago).delete()
