import datetime

from django.db import transaction

from core.api_moy_sklad.network.change_order_status import change_order_status
from core.api_moy_sklad.network.post_enter import CreateEnterDocument
from core.consumers import ws_group_updates, EqNotificationActions
from core.services.assignment_generator import AssignmentGenerator
from core.models import OrderProduct, Assignment, ProductionStep
from staff.models import Employee, Department, Audit


class UpdateAssignments:
    def __init__(self, series_id, numbers, department_number, action, pin_code, view_mode):
        self.series_id: str = series_id
        self.numbers: list[int] = numbers
        self.department_number: int = department_number
        self.action: str = action
        self.pin_code: str = pin_code
        self.view_mode: int = view_mode

        self.notification_data: dict = {}
        self.order_product: OrderProduct | None = None
        self.department: Department | None = None
        self.action_name: str = ''
        self.original_user: Employee | None = None

    def _check_pin_code_in_view_mode(self):
        if self.view_mode not in [0, 1, 2, '0', '1', '2']:
            self.original_user = Employee.objects.get(pin_code=self.pin_code)
            self.pin_code = self.view_mode

    def _update_target_numbers(self):
        """Изменение нарядов/поручений с переданным списком номеров"""
        for number in self.numbers:
            assignment = Assignment.objects.get(
                number=number,
                order_product__series_id=self.series_id,
                department__number=self.department_number,
            )
            match self.action:
                case 'await_to_in_work':
                    if assignment.status == 'await':
                        self.action_name = 'Взял в работу'

                        assignment.status = 'in_work'
                        assignment.executor = Employee.objects.get(pin_code=self.pin_code)
                        assignment.save()
                        self.notification_data[self.department_number] = {
                            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                            'data': assignment.order_product.id,
                            'lists': ['await', 'in_work']
                        }
                    continue

                case 'in_work_to_ready':
                    if assignment.status == 'in_work':
                        self.action_name = 'Отметил готовыми'

                        assignment.status = 'ready'
                        assignment.date_completion = datetime.datetime.now()
                        assignment.save()
                        self.notification_data[self.department_number] = {
                            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                            'data': assignment.order_product.id,
                            'lists': ['await', 'in_work', 'ready']
                        }
                    continue

                case 'ready_to_in_work':
                    if assignment.status == 'ready':
                        self.action_name = 'Вернул в работу'

                        assignment.status = 'in_work'
                        assignment.date_completion = None
                        assignment.save()
                        self.notification_data[self.department_number] = {
                            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                            'data': assignment.order_product.id,
                            'lists': ['await', 'in_work', 'ready']
                        }
                    continue

                case 'in_work_to_await':
                    if assignment.status == 'in_work':
                        self.action_name = 'Вернул в ожидание'

                        assignment.status = 'await'
                        assignment.executor = None
                        assignment.save()
                        self.notification_data[self.department_number] = {
                            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                            'data': assignment.order_product.id,
                            'lists': ['await', 'in_work']
                        }
                    continue

                case 'confirmed':
                    if assignment.status == 'ready':
                        self.action_name = 'Подтвердил готовность'

                        assignment.inspector = Employee.objects.get(pin_code=self.pin_code)
                        assignment.save()
                        self.notification_data[self.department_number] = {
                            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                            'data': assignment.order_product.id,
                            'lists': ['ready']
                        }
                    continue

                case _:
                    raise Exception()

    def _init_production_step_schema(self):
        """Итерируемся по JSON схеме технологического процесса и создаем этапы производства"""
        schema = self.order_product.product.technological_process.schema

        for target_department_name, related_department_names in schema.items():
            production_step = ProductionStep.objects.get_or_create(
                department=Department.objects.get(name=target_department_name),
                product=self.order_product.product,
            )[0]

            for department_name in related_department_names:
                production_step.next_step.add(
                    ProductionStep.objects.get_or_create(
                        department=Department.objects.get(name=department_name),
                        product=self.order_product.product,
                    )[0].id
                )

    def _set_technological_process_confirmed(self):
        self.order_product.product.technological_process_confirmed = Employee.objects.get(pin_code=self.pin_code)
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
            next_step=next_step
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
        ).count()

    def _get_target_size_for_create_assignments(self, next_step: ProductionStep) -> int:
        related_assignments_confirmed_minimum_count = self._get_related_assignments_confirmed_minimum_count(next_step)
        next_step_assignments_count = self._get_next_step_assignments_count(next_step)
        if next_step.department.single and \
                related_assignments_confirmed_minimum_count and \
                not next_step_assignments_count:
            return 1
        return related_assignments_confirmed_minimum_count - next_step_assignments_count

    def _create_related_assignments(self, from_constructors: bool = False):
        """Получаем список последующих этапов"""
        self.department = Department.objects.get(number=self.department_number)

        next_steps = ProductionStep.objects.get(
            product=self.order_product.product,
            department=self.department
        ).next_step.all()

        for next_step in next_steps:
            if next_step.department.name == "Готово":
                self._ready_department_instruction()
                break

            target_size = self._get_target_size_for_create_assignments(next_step)

            if target_size:
                self.notification_data[next_step.department.number] = {
                    'action': EqNotificationActions.UPDATE_TARGET_LIST.value,
                    'data': '',
                    'lists': ['await']
                }

                if from_constructors:
                    """
                    Если наряд поступил от конструкторов производим генерацию нарядов всех серий ожидающих разработки.
                    """
                    order_products = OrderProduct.objects.filter(
                        product=self.order_product.product,
                    )

                    for order_product in order_products:
                        AssignmentGenerator.create_new_assignments(
                            order_product=order_product,
                            department=next_step.department,
                            quantity=target_size
                        )
                else:
                    AssignmentGenerator.create_new_assignments(
                        order_product=self.order_product,
                        department=next_step.department,
                        quantity=target_size
                    )

    def _confirmation_instructions(self):
        """Действия при визировании бригадиром наряда"""
        self.order_product = OrderProduct.objects.get(series_id=self.series_id)

        """Проверяем условие, что происходит подтверждение в отделе конструкторов и тех-процесс выбран"""
        if self.department_number == 1 and self.order_product.product.technological_process is not None:
            self._set_technological_process_confirmed()
            self._delete_constructor_relations()
            self._init_production_step_schema()

            """Переопределяем контекст номера отдела т.к. дальнейшее создание нарядов пойдет со стартового отдела"""
            self.department_number = 0
            self._create_related_assignments(from_constructors=True)

        else:
            self._create_related_assignments()

    def _get_audit_details(self) -> str:
        order_product = OrderProduct.objects.get(series_id=self.series_id)

        result = ''

        if self.view_mode == 1:
            result += 'В режиме бригадира'
        if len(str(self.view_mode)) == 6:
            view_mode_user = Employee.objects.get(pin_code=self.pin_code)
            result += f'В режиме, от имени пользователя ' \
                      f'{view_mode_user.first_name} {view_mode_user.last_name}'
        result += f' {self.action_name} изделия под номерами: {self.numbers}.'
        result += f'Номер серии: {order_product.series_id}. Изделие: {order_product.product.name}'
        return result

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

        Audit.objects.create(
            employee=self.original_user or Employee.objects.get(pin_code=self.pin_code),
            details=self._get_audit_details()
        )

        """Делаем рассылку на обновление данных в WS"""
        ws_group_updates(pin_code=self.pin_code, notification_data=self.notification_data)
