"""Initial methods and scripts."""
import logging

from core.models import OrderProduct, Assignment
from django_app.init_data.reports.finance import get_finance_report

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    op_from_series_id = "1-33346"
    op_to_series_id = "3-33346"

    op_from = OrderProduct.objects.get(series_id=op_from_series_id)
    op_to = OrderProduct.objects.get(series_id=op_to_series_id)

    target_assignments = Assignment.objects.filter(
        order_product=op_from,
        number__gte=3
    )

    for assignment in target_assignments:
        assignment.number += 9
        assignment.order_product = op_to
        assignment.save()


    # get_finance_report()

    print('PASS')
    return f"Oki"
