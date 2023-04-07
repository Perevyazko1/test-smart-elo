from ..models import OrderProduct, Assignment, ProductionStep
from staff.models import Department


class AssignmentGenerator:
    @staticmethod
    def create_new_assignments(order_product: OrderProduct, department: Department, quantity: int = 1):
        assignment_price = ProductionStep.objects.get(product=order_product.product, department=department).tax

        if department.single:
            numbers = [1]
        else:
            start_position = Assignment.objects.filter(order_product=order_product, department=department).count()
            last_position = start_position + quantity
            if last_position > order_product.quantity:
                print("CREATE_NEW_ASSIGNMENTS: передано количество больше чем лимит серии.")
                last_position = order_product.quantity
            numbers = [i for i in range(start_position+1, last_position+1)]

        for number in numbers:
            Assignment.objects.update_or_create(
                number=number,
                order_product=order_product,
                department=department,
                defaults={
                    "price": assignment_price,
                    "notes": 'Создан автоматически'
                }
            )

    def init_order_product_assignments(self, order_product: OrderProduct):
        # Инициализация первого уровня нарядов связанных со стартовым
        production_steps = order_product.product.production_steps.filter(department__number=0)
        for production_step in production_steps:
            for next_step in production_step.next_step.all():
                self.create_new_assignments(
                    order_product=order_product,
                    department=next_step.department,
                    quantity=int(order_product.quantity)
                )
