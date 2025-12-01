"""Initial methods and scripts."""
import logging

# from core.models import OrderProduct, Assignment
from django_app.init_data.reports.finance import get_finance_report

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    get_finance_report()
    #
    # active_order_products = OrderProduct.objects.filter(status="0")
    #
    # for order_product in active_order_products:
    #     assignments = Assignment.objects.filter(order_product=order_product)
    #     assignments.update(sort_date=order_product.order.planned_date)

    print('PASS')
    return f"Oki"
