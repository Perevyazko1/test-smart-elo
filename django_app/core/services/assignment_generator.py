from django.db import transaction

from staff.models import Department
from ..consumers import ws_update_notification

from ..models import OrderProduct, Assignment, ProductionStep


class AssignmentGenerator:
    @staticmethod
    @transaction.atomic
    def create_new_assignments(
            order_product: OrderProduct,
            department: Department,
            quantity: int = 1,
            status: str = 'await',
    ):
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
            Assignment.objects.create(
                number=number,
                order_product=order_product,
                department=department,
                new_tariff=assignment_tariff,
                notes='Создан автоматически',
                status=status,
            )

    def init_order_product_assignments(self, order_product: OrderProduct):
        """Инициализация первого уровня нарядов связанных со стартовым"""

        """
        Если в отделе конструкторов есть наряд в разработке с данным товаром -
         игнорируем генерацию новых нарядов
        """
        if Assignment.objects.filter(
            order_product__product=order_product.product,
            department__number=1
        ).exclude(status='ready', inspector__isnull=False):
            return

        production_steps = order_product.product.production_steps.all().exclude(is_active=False)
        start_production_steps = order_product.product.production_steps.get(department__number=0)

        for production_step in production_steps:
            """Пропускаем отделы старт и готово"""
            if production_step.department.number in [0, 50]:
                continue

            """Если отдел находится в списке стартовых - генерируем наряд в статусе ожидает"""
            if production_step in start_production_steps.next_step.all():
                self.create_new_assignments(
                    order_product=order_product,
                    department=production_step.department,
                    quantity=int(order_product.quantity)
                )
                ws_update_notification(production_step.department.number)
            else:
                """Если отдел не в списке стартовых и отдел не конструкторов - генерируем наряд в статусе создан"""
                if not production_step.department.number == 1:
                    self.create_new_assignments(
                        order_product=order_product,
                        department=production_step.department,
                        quantity=int(order_product.quantity),
                        status='created',
                    )
