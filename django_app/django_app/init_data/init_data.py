"""Initial methods and scripts."""
import logging

from core.models import OrderProduct, Assignment
from django_app.init_data.reports.finance import get_finance_report

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    target_op = OrderProduct.objects.filter(status=0)

    for op in target_op:
        if not Assignment.objects.filter(
                order_product=op,
        ).exclude(
            status='ready'
        ).exists():
            op.status = 1
            op.save()


    get_finance_report()

    print('PASS')
    return f"Oki"
