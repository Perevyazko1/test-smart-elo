from datetime import datetime

from django.db import transaction

from core.api_moy_sklad.network.change_order_status import change_order_status
from core.api_moy_sklad.network.post_enter import CreateEnterDocument
from core.consumers import EqNotificationActions, ws_update_notification, ws_send_to_department, ws_group_updates
from core.models import OrderProduct, Assignment, AssignmentCoExecutor, ProductionStep
from core.signals import update_assignments_and_clean_cache
from src.log_time import log_time
from staff.models import Department, Employee, Transaction, Audit


class EqUpdateAssignmentsStatus:
    def __init__(self, op_id, assignment_ids, department, action, employee, view_mode, selected_user):
        self.assignment_ids: list[int] = assignment_ids
        self.department: Department = department
        self.action: str = action
        self.selected_user: str = selected_user
        self.employee: Employee = employee
        self.view_mode: str | None = view_mode

        self.notification_data: dict = {}
        self.order_product = OrderProduct.objects.select_related('product').get(id=op_id)
        self.action_name: str = ''
        self.original_user: Employee | None = None

    @log_time
    def _check_view_mode_by_id(self):
        self.original_user = self.employee
        if str(self.view_mode).isdigit() or self.view_mode == "distribute":
            target_id = self.selected_user if self.view_mode == "distribute" else self.view_mode
            self.employee = Employee.objects.get(id=target_id)

    def _update_target_numbers(self):
        qs_filter = {
            "id__in": self.assignment_ids
        }

        match self.action:
            case 'await_to_in_work':
                self.action_name = 'Взял в работу'

                update_data = {
                    'status': 'in_work',
                    'executor': self.employee,
                    'appointment_date': datetime.now(),
                }
                qs_filter["status"] = "await"

                """Проверка режима назначения"""
                if (str(self.view_mode).isdigit() or
                        (self.view_mode == 'distribute' and self.selected_user)):
                    update_data["appointed_by_boss"] = True

            case 'in_work_to_in_work_distribute':
                self.action_name = 'Назначил'

                update_data = {
                    'status': 'in_work',
                    'executor': self.employee,
                    'appointment_date': datetime.now(),
                    'appointed_by_boss': True,
                }
                qs_filter["status"] = "in_work"

            case 'in_work_to_await_distribute':
                self.action_name = 'Вернул в распределение'
                update_data = {
                    'status': 'in_work',
                    'executor': self.original_user,
                    'appointed_by_boss': False,
                }
                qs_filter["status"] = "in_work"

                AssignmentCoExecutor.objects.filter(
                    assignment__id__in=self.assignment_ids,
                ).delete()

            case 'in_work_to_ready':
                self.action_name = 'Отметил готовыми'
                update_data = {
                    'status': 'ready',
                    'date_completion': datetime.now(),
                }

                qs_filter["status"] = "in_work"
                qs_filter["assembled"] = True

            case 'ready_to_in_work':
                self.action_name = 'Вернул в работу'
                qs_filter["status"] = "ready"
                qs_filter["inspector__isnull"] = True

                update_data = {
                    'status': 'in_work',
                    'date_completion': None,
                }

            case 'in_work_to_await':
                self.action_name = 'Вернул в ожидание'
                update_data = {
                    'status': 'await',
                    'executor': None,
                    'appointment_date': None,
                    'appointed_by_boss': False,
                }
                qs_filter["status"] = "in_work"

                AssignmentCoExecutor.objects.filter(
                    assignment__id__in=self.assignment_ids,
                ).delete()

            case 'confirmed':
                self.action_name = 'Подтвердил готовность'
                if self.original_user:
                    inspector = self.original_user
                else:
                    inspector = self.employee
                update_data = {
                    'inspector': inspector,
                    'inspect_date': datetime.now(),
                }
                qs_filter["inspector__isnull"] = True

            case _:
                return (
                    f'Передана неизвестная команда на обновление нарядов: {self.action}. '
                    f'Сообщите о проблеме администратору'
                )

        update_assignments_and_clean_cache(
            assignments_qs=Assignment.objects.filter(**qs_filter),
            order_product__id=self.order_product.id,
            department__id=self.department.id,
            **update_data
        )

        self.notification_data[self.department.number] = {
            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
            'data': self.order_product.id,
        }

    def _create_api_enter(self):
        CreateEnterDocument.execute(
            product=self.order_product.product,
            quantity=len(self.assignment_ids),
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

    def _get_next_step_assembled_assignments_count(self, next_step: ProductionStep):
        return Assignment.objects.filter(
            order_product=self.order_product,
            department=next_step.department,
            assembled=True,
        ).count()

    def _get_target_size_for_activate_assignments(self, next_step: ProductionStep) -> int:
        related_assignments_confirmed_minimum_count = self._get_related_assignments_confirmed_minimum_count(next_step)
        next_step_assignments_count = self._get_next_step_assembled_assignments_count(next_step)
        if next_step.department.single and \
                related_assignments_confirmed_minimum_count and \
                not next_step_assignments_count:
            return 1
        return related_assignments_confirmed_minimum_count - next_step_assignments_count

    def _activate_assignments(self):
        """Делаем проверку готовности в других отделах и активируем нужное количество нарядов"""
        if self.department.number == 1:
            active_order_products = OrderProduct.objects.filter(
                product=self.order_product.product,
                status="0"
            )
            next_steps = ProductionStep.objects.get(
                product=self.order_product.product,
                department=Department.objects.get(number=0)
            ).next_step.all()

            for order_product in active_order_products:
                for next_step in next_steps:
                    """
                    Итерируемся по всем последующим отделам. Игнорируем не активные этапы
                    """
                    if not next_step.is_active:
                        continue

                    assignments = Assignment.objects.filter(
                        order_product=order_product,
                        department=next_step.department,
                        assembled=False,
                    )
                    update_assignments_and_clean_cache(
                        assignments_qs=assignments,
                        order_product__id=order_product,
                        department__id=next_step.department.id,
                        assembled=True
                    )

                    self.notification_data[next_step.department.number] = {
                        'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                        'data': self.order_product.id,
                    }

        else:
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
                target_size = self._get_target_size_for_activate_assignments(next_step)

                if target_size:
                    """Если количество отлично от нуля переводим наряды в статус ожидает"""
                    start_position = Assignment.objects.filter(
                        order_product=self.order_product,
                        department=next_step.department,
                        assembled=True,
                    ).count()

                    last_position = start_position + target_size
                    if last_position > self.order_product.quantity:
                        last_position = self.order_product.quantity
                    numbers = [i for i in range(start_position + 1, last_position + 1)]

                    assignments = Assignment.objects.filter(
                        order_product=self.order_product,
                        department=next_step.department,
                        number__in=numbers,
                        assembled=False,
                    )
                    # Очистка кеша по карточкам
                    update_assignments_and_clean_cache(
                        assignments_qs=assignments,
                        order_product__id=self.order_product.id,
                        department__id=next_step.department.id,
                        assembled=True
                    )

                    self.notification_data[next_step.department.number] = {
                        'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                        'data': self.order_product.id,
                    }

    def _set_technological_process_confirmed(self):
        self.order_product.product.technological_process_confirmed = self.original_user
        self.order_product.product.save()

    def _tariffication_instruction(self):
        tariff_created = False

        for assignment_id in self.assignment_ids:
            target_assignment = Assignment.objects.get(
                id=assignment_id,
            )
            if target_assignment.new_tariff:
                target_assignment.tariffication_date = datetime.now()
                target_assignment.save()

                if target_assignment.new_tariff.amount:
                    tariff_created = True

                    co_executors = AssignmentCoExecutor.objects.filter(
                        assignment=target_assignment
                    )
                    description = (f'Соисполнитель в производстве полуфабриката {target_assignment} '
                                   f'{target_assignment.department.name}')
                    for co_executor in co_executors:
                        Transaction.objects.create(
                            transaction_type='accrual',
                            details='wages',
                            amount=co_executor.amount,
                            employee=co_executor.co_executor,
                            executor=target_assignment.inspector,
                            inspector=target_assignment.inspector,
                            description=description,
                        )

                    description = (f'Производство полуфабриката {target_assignment} '
                                   f'{target_assignment.department.name}')

                    Transaction.objects.create(
                        transaction_type='accrual',
                        details='wages',
                        amount=target_assignment.amount,
                        employee=target_assignment.executor,
                        executor=target_assignment.inspector,
                        inspector=target_assignment.inspector,
                        description=description,
                    )

        if tariff_created:
            ws_send_to_department(
                self.department.number,
                {'action': 'WEEK_INFO_UPDATED'}
            )

    def _confirmation_instructions(self):
        """Действия при визировании бригадиром наряда"""
        """Проверяем условие, что происходит подтверждение в отделе конструкторов и тех-процесс выбран"""
        if self.department.number == 1 and self.order_product.product.technological_process is not None:
            self._set_technological_process_confirmed()

        self._activate_assignments()

    def _get_audit_details(self) -> str:
        result = ''

        if self.view_mode == 'boss':
            result += 'В режиме бригадира'
        if not self.original_user == self.employee:
            result += f'В режиме "От имени сотрудника" ' \
                      f'{self.employee.first_name} {self.employee.last_name}'
        result += f' {self.action_name} изделия под номерами: {self.assignment_ids}.'
        result += f'Номер серии: {self.order_product.series_id}. Изделие: {self.order_product.product.name}'
        return result

    @log_time
    def _create_audit(self):
        Audit.objects.create(
            employee=self.original_user or self.employee,
            details=self._get_audit_details()
        )

    @log_time
    @transaction.atomic
    def execute(self):
        """Произвести обновление переданных нарядов и создать последующие"""
        result = ''
        """Установка конфигурации пользователей на основании заданного режима просмотра. """
        self._check_view_mode_by_id()

        """Производим обновление переданных номеров"""
        self._update_target_numbers()

        """В случае если происходит подтверждение наряда создаем связанные наряды"""
        if self.action == "confirmed":
            self._confirmation_instructions()
            if self.department.piecework_wages:
                self._tariffication_instruction()

        """Делаем рассылку на обновление данных в WS"""
        ws_group_updates(pin_code=self.original_user.pin_code, notification_data=self.notification_data)
        ws_update_notification(self.department.number)

        self._create_audit()
