"""Initial methods and scripts."""
from core.models import Assignment, OrderProduct


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    t_order_product = OrderProduct.objects.get(
        series_id="{4}24856"
    )

    Assignment.objects.filter(
        order_product=t_order_product,
        number__gte=301
    ).delete()

    return "Ok"
