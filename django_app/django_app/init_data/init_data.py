"""Initial methods and scripts."""
import logging

from core.consumers import ws_send_to_all, EqNotificationActions
from core.models import Order, OrderProduct, Assignment
from core.services.assignment_generator import AssignmentGenerator
from core.services.check_schema import check_schema, compare_schemas
from core.services.create_custom_tech_process import create_and_set_tech_process
from core.services.update_production_steps import update_production_steps
from core.views import app_error_response, actualized_assembled
from staff.models import Department

logger = logging.getLogger(__name__)


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')

    project_name = 'Серийная мебель'

    target_orders = Order.objects.filter(project=project_name)

    target_order_products = OrderProduct.objects.filter(
        order__in=target_orders
    )
    fixed_products_ids = []

    for order_product in target_order_products:
        product = order_product.product

        if product.id in fixed_products_ids:
            continue
        if product.technological_process is None:
            continue

        if "Подрядчики" in product.technological_process.schema:
            print(product.name, "🌞")
        else:
            if "Обивка" in product.technological_process.schema and "Сборка" in product.technological_process.schema:
                new_schema = product.technological_process.schema
                new_schema["Старт"].append("Подрядчики")
                new_schema["Подрядчики"] = ["Обивка"]
                if not check_schema(new_schema):
                    print(product.name, "❌ Схема не валидна ❌")
                else:
                    print(product.name, "🪲 Схема валидна 🪲")

                    active_ops = OrderProduct.objects.filter(
                        product=product,
                        status="0"
                    )

                    process_edited = False

                    if product.technological_process:
                        process_edited = True
                        difference = compare_schemas(
                            product.technological_process.schema,
                            new_schema,
                        )

                        """Если имеются удаленные наряды - то проверяем есть ли там в работе или готовое. """
                        if difference['removed']:
                            for key in difference['removed'].keys():
                                department = Department.objects.get(name=key)
                                assignments = Assignment.objects.filter(
                                    order_product__in=active_ops,
                                    department=department,
                                )
                                active_assignments = assignments.exclude(status="await")

                                if active_assignments.exists():
                                    report = {}
                                    for assignment in assignments:
                                        dept_name = assignment.department.name
                                        if dept_name not in report:
                                            report[dept_name] = 0
                                        report[dept_name] += 1

                                    error_msg = "Ошибка. Для изменения тех процесса устраните замечание:\n"
                                    error_msg += "Имеются наряды в работе/готовые в отделах:\n"

                                    for dept, count in report.items():
                                        error_msg += f"{dept}: {count}шт\n"

                                    return app_error_response(error_msg)

                                """В случае если нарушений не найдено - удаляем наряды с этими отделами. """
                                assignments.delete()
                        else:
                            pass

                    """Создаем или находим техпроцесс, задаем его товару"""
                    create_and_set_tech_process(
                        schema=new_schema,
                        product=product
                    )
                    """Обновляем этапы производства создавая новые и изменяя текущие согласно схеме. """
                    product.refresh_from_db()
                    update_production_steps(product)

                    for order_product in active_ops:
                        AssignmentGenerator().init_order_product_assignments(order_product=order_product)
                        if process_edited:
                            actualized_assembled(order_product)
                        ws_send_to_all({
                            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                            'data': order_product.id,
                        })

    print('PASS')
    return f"Oki"
