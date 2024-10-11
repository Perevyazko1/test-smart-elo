"""Initial methods and scripts. """
from core.models import Assignment, OrderProduct
from staff.models import Department
from core.signals import update_assignments_and_clean_cache


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    department = Department.objects.get(name="Обивка")
    order_product = OrderProduct.objects.get(series_id="{8}24322")

    target_assignments = Assignment.objects.filter(
        order_product=order_product,
        department=department
    )

    update_assignments_and_clean_cache(
        target_assignments,
        order_product.id,
        department.id,
        assembled=True,
    )
