from django.db import transaction

from staff.models import Department
from ..consumers import ws_update_notification, ws_group_updates, EqNotificationActions, ws_send_to_department

from ..models import OrderProduct, Assignment, ProductionStep


class AssignmentGenerator:
    @staticmethod
    @transaction.atomic
    def create_new_assignments(
            order_product: OrderProduct,
            department: Department,
            quantity: int = 1,
            assembled: bool = True,
    ):
        notification_data = {}
        assignment_tariff = ProductionStep.objects.get(
            product=order_product.product, department=department
        ).confirmed_tariff

        if department.single:
            numbers = [1]
        else:
            start_position = Assignment.objects.filter(order_product=order_product, department=department).count()
            last_position = start_position + quantity
            if last_position > order_product.quantity:
                print("CREATE_NEW_ASSIGNMENTS: передано количество больше чем лимит серии.")
                last_position = order_product.quantity
            numbers = [i for i in range(start_position + 1, last_position + 1)]

        for number in numbers:
            Assignment.objects.update_or_create(
                number=number,
                order_product=order_product,
                department=department,
                defaults={
                    "new_tariff": assignment_tariff,
                    "notes": 'Создан автоматически',
                    "assembled": assembled,
                }
            )
        notification_data[department.number] = {
            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
            'data': order_product.series_id,
        }
        ws_group_updates(pin_code="", notification_data=notification_data)
        ws_update_notification(department.number)

    def init_order_product_assignments(self, order_product: OrderProduct):
        """Инициализация первого уровня нарядов связанных со стартовым"""

        """ Проверяем наличие техпроцесса. """
        if not order_product.product.technological_process:
            if Assignment.objects.filter(
                    order_product__product=order_product.product,
                    department__number=1
            ).exclude(status='ready', inspector__isnull=False):
                """
                Если нет техпроцесса и есть наряд в разработке на данное изделие - игнорируем дальнейшие действия. 
                """
                return
            else:
                """ Если нет техпроцесса и нет наряда на разработку - создаем наряд на разработку. """
                self.create_new_assignments(
                    order_product=order_product,
                    department=Department.objects.get(number=1),
                    quantity=1,
                    assembled=True,
                )
                ws_send_to_department(
                    1,
                    {
                        'action': 'NEW_NOTIFICATION',
                        'title': "ЭЛО - Новое изделие в разработке",
                        'body': order_product.product.name,
                        'tag': f'product{order_product.id}',
                        'url': f'/eq'
                    }
                )

                return
        else:
            """Делаем выборку этапов производства исключая Конструкторов, Старт и Готово"""
            production_steps = order_product.product.production_steps.filter(
                is_active=True,
            ).exclude(department__number__in=[0, 50, 1])

            if order_product.product.technological_process_confirmed:
                """Если технологический процесс уже утвержден - то создаем и активируем наряды по схеме. """
                start_production_steps = order_product.product.production_steps.get(department__number=0)
                for production_step in production_steps:
                    """Если отдел находится в списке стартовых - генерируем наряд в статусе ожидает"""
                    if production_step in start_production_steps.next_step.all():
                        self.create_new_assignments(
                            order_product=order_product,
                            department=production_step.department,
                            quantity=int(order_product.quantity),
                            assembled=True,
                        )
                    else:
                        self.create_new_assignments(
                            order_product=order_product,
                            department=production_step.department,
                            quantity=int(order_product.quantity),
                            assembled=False,
                        )
            else:
                """Если технологический процесс еще не утвержден - то создаем наряды без активации согласно схеме. """
                for production_step in production_steps:
                    self.create_new_assignments(
                        order_product=order_product,
                        department=production_step.department,
                        quantity=int(order_product.quantity),
                        assembled=False,
                    )
