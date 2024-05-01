from core.models import Order, OrderProduct


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    orders_sq = Order.objects.all()

    for order in orders_sq:
        order_products_active_exists = OrderProduct.objects.filter(
            status="0"
        ).exists()
        if not order_products_active_exists:
            order.status = "1"
            order.save()
