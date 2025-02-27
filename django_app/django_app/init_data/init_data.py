"""Initial methods and scripts."""
from core.models import OrderProduct, Assignment

def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    target_op = OrderProduct.objects.get(
        series_id="{3}24856"
    )
    target_assignments = Assignment.objects.filter(
        order_product=target_op
    )
    target_assignments.delete()
    target_op.delete()
    return "OK"
