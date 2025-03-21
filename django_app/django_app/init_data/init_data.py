"""Initial methods and scripts."""
from core.models import OrderProduct
import re


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    target_op = OrderProduct.objects.all()

    for op in target_op:
        result = re.sub(r'^\{(\d+)\}(.*)$', r'\1-\2', op.series_id)
        op.series_id = result
        op.save()

    return "Ok"
