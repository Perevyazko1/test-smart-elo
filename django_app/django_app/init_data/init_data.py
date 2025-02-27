"""Initial methods and scripts."""
from core.models import OrderProduct

def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    target_op = OrderProduct.objects.get(
        series_id="{3}24856"
    )
    target_op.assignments.all().delete()
    target_op.delete()
    return "OK"
