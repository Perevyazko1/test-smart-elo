import datetime

from core.methods.assignment_generator import AssignmentGenerator
from core.models import OrderProduct, Assignment, ProductionStep
from staff.models import Employee, Department


class UpdateAssignments:
    def execute(
            self,
            series_id: str,
            numbers: list[int],
            department_number: int,
            action: str,
            pin_code: int,
            view_mode: str,
    ):
        if not view_mode == 1 and not view_mode == 0:
            pin_code = view_mode

        for number in numbers:
            assignment = Assignment.objects.get(
                number=number,
                order_product__series_id=series_id,
                department__number=department_number,
            )
            match action:
                case 'await_to_in_work':
                    if assignment.status == 'await':
                        assignment.status = 'in_work'
                        assignment.executor = Employee.objects.get(pin_code=pin_code)
                        assignment.save()
                    continue

                case 'in_work_to_ready':
                    if assignment.status == 'in_work':
                        assignment.status = 'ready'
                        assignment.date_completion = datetime.datetime.now()
                        assignment.save()
                    continue

                case 'ready_to_in_work':
                    if assignment.status == 'ready':
                        assignment.status = 'in_work'
                        assignment.date_completion = None
                        assignment.save()
                    continue

                case 'in_work_to_await':
                    if assignment.status == 'in_work':
                        assignment.status = 'await'
                        assignment.executor = None
                        assignment.save()
                    continue

                case 'confirmed':
                    if assignment.status == 'ready':
                        assignment.inspector = Employee.objects.get(pin_code=pin_code)
                        assignment.save()
                    continue

                case _:
                    raise Exception()
        if action == "confirmed":
            order_product = OrderProduct.objects.get(series_id=series_id)
            if department_number == 1 and order_product.product.technological_process is not None:
                order_product.product.technological_process_confirmed = Employee.objects.get(pin_code=pin_code)
                order_product.product.save()

                self._create_production_step_schema(order_product)
                self._create_related_assignments(
                    order_product=order_product,
                    department=Department.objects.get(name="Старт")
                )
            else:
                self._create_related_assignments(
                    order_product=order_product,
                    department=Department.objects.get(number=department_number)
                )

    @staticmethod
    def _create_production_step_schema(order_product: OrderProduct):
        """Создание последовательностей производства на основании технологического процесса товара"""
        tech_process = order_product.product.technological_process
        schema = tech_process.schema

        first_production_step = ProductionStep.objects.get(
            department=Department.objects.get(name="Старт"),
            product=order_product.product
        )

        first_production_step.next_step.remove(
            ProductionStep.objects.get(
                department=Department.objects.get(name="Конструктора"),
                product=order_product.product
            ))

        for target_department_name, related_department_names in schema.items():
            print(target_department_name, related_department_names)
            production_step = ProductionStep.objects.get_or_create(
                department=Department.objects.get(name=target_department_name),
                product=order_product.product,
            )[0]
            for department_name in related_department_names:
                production_step.next_step.add(
                    ProductionStep.objects.get_or_create(
                        department=Department.objects.get(name=department_name),
                        product=order_product.product,
                    )[0].id
                )

    @staticmethod
    def _create_related_assignments(order_product: OrderProduct, department: Department):
        """Получаем список последующих этапов"""
        next_steps = ProductionStep.objects.get(
            product=order_product.product,
            department=department
        ).next_step.all()

        for next_step in next_steps:
            """Получаем список всех связанных предыдущих этапов"""
            related_steps = ProductionStep.objects.filter(
                product=order_product.product,
                next_step=next_step
            )

            """Если изначальный отдел единичный исполнитель и последующий не единичный - """
            """ - устанавливаем минимальное значение в размере полной серии"""
            if department.single and not next_step.department.single:
                min_ready_size = order_product.quantity
            elif department.name == "Старт" and not next_step.department.single:
                min_ready_size = order_product.quantity
            elif department.name == "Старт" and next_step.department.single:
                min_ready_size = 1
            else:
                """Иначе исходным значением будет количество подтвержденных нарядов исходного отдела"""
                min_ready_size = Assignment.objects.filter(
                    order_product=order_product,
                    department=department,
                    status='ready',
                    executor__isnull=False
                ).count()

            for related_step in related_steps:
                """Итерируемся по связанным процессам, проверяем количество готовых нарядов"""
                assignment_ready_size = Assignment.objects.filter(
                    order_product=order_product,
                    department=related_step.department,
                    status='ready',
                    executor__isnull=False
                ).count()

                """Если связанный отдел единичный и у него все готово - переходим к следующему этапу"""
                if related_step.department.single and assignment_ready_size:
                    continue

                """Если наряд стартовый - переходим к следующему этапу"""
                if related_step.department.name == "Старт":
                    continue

                """Если количество готовых нарядов меньше чем минимальное значение, записываем новый минимум"""
                min_ready_size = min(min_ready_size, assignment_ready_size)

            target_size = min_ready_size - Assignment.objects.filter(
                order_product=order_product,
                department=next_step.department
            ).count()

            # TODO Декомпозировать всю эту жесть

            if next_step.department.name == "Готово" and target_size:
                print("СОЗДАЕТСЯ ПРИХОДИНК В МОЕМ СКЛАДЕ")
                break

            if target_size:
                AssignmentGenerator.create_new_assignments(
                    order_product=order_product,
                    department=next_step.department,
                    quantity=target_size
                )
