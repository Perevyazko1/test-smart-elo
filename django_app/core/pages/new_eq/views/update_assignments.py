import datetime

from django.db import transaction

from core.api_moy_sklad.network.change_order_status import change_order_status
from core.api_moy_sklad.network.post_enter import CreateEnterDocument
from core.consumers import ws_group_updates, EqNotificationActions
from core.services.assignment_generator import AssignmentGenerator
from core.models import OrderProduct, Assignment, ProductionStep
from core.services.update_production_steps import update_production_steps
from staff.models import Employee, Department, Audit, Transaction


class UpdateAssignments:
    def __init__(self, series_id, numbers, department, action, employee, view_mode):
        self.series_id: str = series_id
        self.numbers: list[int] = numbers
        self.department: Department = department
        self.action: str = action
        self.employee: Employee = employee
        self.view_mode: str | None = view_mode

        self.notification_data: dict = {}
        self.order_product: OrderProduct | None = None
        self.action_name: str = ''
        self.original_user: Employee | None = None

    def _check_pin_code_in_view_mode(self):
        self.original_user = self.employee
        if self.view_mode not in ['self', 'boss', 'unfinished'] and self.view_mode is not None:
            self.employee = Employee.objects.get(id=self.view_mode)

    def _update_target_numbers(self):
        """Изменение нарядов/поручений с переданным списком номеров"""
        for number in self.numbers:
            assignment = Assignment.objects.get(
                number=number,
                order_product__series_id=self.series_id,
                department=self.department,
            )
            match self.action:
                case 'await_to_in_work':
                    if assignment.status == 'await':
                        self.action_name = 'Взял в работу'

                        if self.view_mode not in ['self', 'boss', 'unfinished', 'None']:
                            assignment.appointed_by_boss = True

                        assignment.status = 'in_work'
                        assignment.executor = self.employee
                        assignment.appointment_date = datetime.datetime.now()
                        assignment.save()
                        self.notification_data[self.department.number] = {
                            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                            'data': assignment.order_product.series_id,
                        }
                    continue

                case 'in_work_to_ready':
                    if assignment.status == 'in_work':
                        self.action_name = 'Отметил готовыми'

                        assignment.status = 'ready'
                        assignment.date_completion = datetime.datetime.now()
                        assignment.save()
                        self.notification_data[self.department.number] = {
                            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                            'data': assignment.order_product.series_id,
                        }
                    continue

                case 'ready_to_in_work':
                    if assignment.status == 'ready' and assignment.inspector is None:
                        self.action_name = 'Вернул в работу'

                        assignment.status = 'in_work'
                        assignment.date_completion = None
                        assignment.save()
                        self.notification_data[self.department.number] = {
                            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                            'data': assignment.order_product.series_id,
                        }
                    continue

                case 'in_work_to_await':
                    if assignment.status == 'in_work':
                        self.action_name = 'Вернул в ожидание'

                        assignment.appointed_by_boss = False
                        assignment.status = 'await'
                        assignment.executor = None
                        assignment.appointment_date = None
                        assignment.save()

                        self.notification_data[self.department.number] = {
                            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                            'data': assignment.order_product.series_id,
                        }
                    continue

                case 'confirmed':
                    if assignment.status == 'ready' and assignment.inspector is None:
                        self.action_name = 'Подтвердил готовность'

                        if self.original_user:
                            inspector = self.original_user
                        else:
                            inspector = self.employee

                        assignment.inspector = inspector
                        assignment.save()
                        self.notification_data[self.department.number] = {
                            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                            'data': assignment.order_product.series_id,
                        }
                    continue

                case _:
                    raise Exception()

    def _init_production_step_schema(self):
        """Итерируемся по JSON схеме технологического процесса и создаем этапы производства"""
        update_production_steps(self.order_product.product)

    def _set_technological_process_confirmed(self):
        self.order_product.product.technological_process_confirmed = self.original_user
        self.order_product.product.save()

    def _delete_constructor_relations(self):
        first_production_step = ProductionStep.objects.get(
            department=Department.objects.get(name="Старт"),
            product=self.order_product.product
        )

        first_production_step.next_step.remove(
            ProductionStep.objects.get(
                department=Department.objects.get(name="Конструктора"),
                product=self.order_product.product
            ))

    def _create_api_enter(self):
        CreateEnterDocument.execute(
            product=self.order_product.product,
            quantity=len(self.numbers),
        )

    def _get_unconfirmed_assignments_exists(self) -> bool:
        return Assignment.objects.filter(
            order_product=self.order_product,
            inspector__isnull=True,
        ).exists()

    def _get_order_all_ready(self) -> bool:
        target_order = self.order_product.order

        for related_order_product in target_order.order_products.all():
            if related_order_product.status != '1':
                return False
        return True

    def _api_change_order_status_to_ready(self):
        change_order_status(str(self.order_product.order.order_id))

    def _ready_department_instruction(self):
        self._create_api_enter()

        if not self._get_unconfirmed_assignments_exists():
            self.order_product.status = '1'
            self.order_product.save()

        if self._get_order_all_ready():
            self._api_change_order_status_to_ready()

    def _get_related_assignments_confirmed_minimum_count(self, next_step: ProductionStep) -> int:
        """Получение минимального количества подтвержденных нарядов со всех предыдущих отделов"""
        related_steps = ProductionStep.objects.filter(
            product=self.order_product.product,
            next_step=next_step,
            is_active=True,
        )

        result = self.order_product.quantity

        for related_step in related_steps:
            if related_step.department.name == "Старт":
                continue

            assignment_ready_size = Assignment.objects.filter(
                order_product=self.order_product,
                department=related_step.department,
                status='ready',
                inspector__isnull=False
            ).count()

            if related_step.department.single and assignment_ready_size:
                continue

            result = min(result, assignment_ready_size)

        return result

    def _get_next_step_assignments_count(self, next_step: ProductionStep):
        return Assignment.objects.filter(
            order_product=self.order_product,
            department=next_step.department
        ).exclude(status='created').count()

    def _get_target_size_for_create_assignments(self, next_step: ProductionStep) -> int:
        related_assignments_confirmed_minimum_count = self._get_related_assignments_confirmed_minimum_count(next_step)
        next_step_assignments_count = self._get_next_step_assignments_count(next_step)
        if next_step.department.single and \
                related_assignments_confirmed_minimum_count and \
                not next_step_assignments_count:
            return 1
        return related_assignments_confirmed_minimum_count - next_step_assignments_count

    def _create_assignments(self):
        """ От конструкторов производим генерацию нарядов всех серий ожидающих разработки. """
        order_products = OrderProduct.objects.filter(
            product=self.order_product.product,
        )

        for order_product in order_products:
            AssignmentGenerator().init_order_product_assignments(
                order_product=order_product
            )

    def _activate_assignments(self):
        """Делаем проверку готовности в других отделах и активируем нужное количество нарядов"""
        next_steps = ProductionStep.objects.get(
            product=self.order_product.product,
            department=self.department
        ).next_step.all()

        for next_step in next_steps:
            """
            Итерируемся по всем последующим отделам. 
            Если отдел Готово - выполняем инструкцию по готовности и выходим.
            """

            if next_step.department.name == "Готово":
                self._ready_department_instruction()
                break

            """Игнорируем не активные этапы"""
            if not next_step.is_active:
                continue

            """Вычисляем количество нарядов к обновлению"""
            target_size = self._get_target_size_for_create_assignments(next_step)

            if target_size:
                """Если количество отлично от нуля переводим наряды в статус ожидает"""
                self.notification_data[next_step.department.number] = {
                    'action': EqNotificationActions.UPDATE_TARGET_LIST.value,
                    'data': '',
                }
                if self.department.single:
                    numbers = [1]
                else:
                    start_position = Assignment.objects.filter(
                        order_product=self.order_product,
                        department=next_step.department
                    ).exclude(status='created').count()

                    last_position = start_position + target_size
                    if last_position > self.order_product.quantity:
                        last_position = self.order_product.quantity
                    numbers = [i for i in range(start_position + 1, last_position + 1)]

                Assignment.objects.filter(
                    order_product=self.order_product,
                    department=next_step.department,
                    number__in=numbers
                ).update(status='await')

    def _confirmation_instructions(self):
        """Действия при визировании бригадиром наряда"""
        self.order_product = OrderProduct.objects.get(series_id=self.series_id)

        """Проверяем условие, что происходит подтверждение в отделе конструкторов и тех-процесс выбран"""
        if self.department.number == 1 and self.order_product.product.technological_process is not None:
            self._set_technological_process_confirmed()
            self._delete_constructor_relations()
            self._init_production_step_schema()
            self._create_assignments()

        else:
            self._activate_assignments()

    def _get_audit_details(self) -> str:
        order_product = OrderProduct.objects.get(series_id=self.series_id)

        result = ''

        if self.view_mode == 'boss':
            result += 'В режиме бригадира'
        if not self.original_user == self.employee:
            result += f'В режиме "От имени сотрудника" ' \
                      f'{self.employee.first_name} {self.employee.last_name}'
        result += f' {self.action_name} изделия под номерами: {self.numbers}.'
        result += f'Номер серии: {order_product.series_id}. Изделие: {order_product.product.name}'
        return result

    def _tariffication_instruction(self):
        for assignment_number in self.numbers:
            target_assignment = Assignment.objects.get(
                number=assignment_number,
                department=self.department,
                order_product=self.order_product
            )
            if target_assignment.tariff:
                if target_assignment.tariff.tariff:
                    description = f'Производство полуфабриката {target_assignment} {target_assignment.department.name}'
                    Transaction.objects.create(
                        transaction_type='accrual',
                        details='wages',
                        amount=target_assignment.tariff.tariff,
                        employee=target_assignment.executor,
                        executor=target_assignment.inspector,
                        inspector=target_assignment.inspector,
                        description=description,
                    )

    @transaction.atomic
    def execute(self):
        """Произвести обновление переданных нарядов и создать последующие"""

        """Проверить был ли передан ПИН-код в режиме просмотра и при необходимости переопределяем его"""
        self._check_pin_code_in_view_mode()

        """Производим обновление переданных номеров"""
        self._update_target_numbers()

        """В случае если происходит подтверждение наряда создаем связанные наряды"""
        if self.action == "confirmed":
            self._confirmation_instructions()
            if self.department.piecework_wages:
                self._tariffication_instruction()

        Audit.objects.create(
            employee=self.original_user or self.employee,
            details=self._get_audit_details()
        )

        """Делаем рассылку на обновление данных в WS"""
        ws_group_updates(pin_code=self.original_user.pin_code, notification_data=self.notification_data)
