from datetime import datetime

from django.db import transaction

from core.api_moy_sklad.network.change_order_status import change_order_status
from core.api_moy_sklad.network.post_enter import CreateEnterDocument
from core.consumers import EqNotificationActions, ws_update_notification, ws_send_to_department, ws_group_updates
from core.models import OrderProduct, Assignment, AssignmentCoExecutor, ProductionStep, Order
from salary.service.make_earning import make_earning
from staff.models import Department, Employee, Audit


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

    def _check_view_mode_by_id(self):
        self.original_user = self.employee
        if str(self.view_mode).isdigit() or self.view_mode == "distribute":
            target_id = self.selected_user if self.view_mode == "distribute" else self.view_mode
            self.employee = Employee.objects.get(id=target_id)

    def _update_target_numbers(self):
        qs_filter: dict[str, int | list[int] | str] = {
            "id__in": self.assignment_ids
        }

        match self.action:
            case 'await_to_in_work':
                self.action_name = 'Взял в работу'

                update_data: dict[str, int | list[int] | str | Employee | datetime | None | bool] = {
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

        Assignment.objects.filter(**qs_filter).update(
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

    def _api_change_order_status_to_ready(self):
        change_order_status(str(self.order_product.order.order_id))

    def _check_order_product_full_ready(self):
        shipped = self.order_product.quantity == self.order_product.shipped
        has_unconfirmed = Assignment.objects.filter(
            order_product=self.order_product,
            inspector__isnull=True,
        ).exists()
        if shipped and not has_unconfirmed:
            self.order_product.status = '1'
            self.order_product.save()
            return True

        return False

    def _get_related_assignments_confirmed_minimum_count(self, next_step: Department) -> int:
        """Получение минимального количества подтвержденных нарядов со всех предыдущих отделов"""
        related_steps = ProductionStep.objects.filter(
            product=self.order_product.product,
            next_steps=next_step,
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

    def _get_next_step_assembled_assignments_count(self, next_step: Department):
        return Assignment.objects.filter(
            order_product=self.order_product,
            department=next_step,
            assembled=True,
        ).count()

    def _get_target_size_for_activate_assignments(self, next_step: Department) -> int:
        related_assignments_confirmed_minimum_count = self._get_related_assignments_confirmed_minimum_count(next_step)
        next_step_assignments_count = self._get_next_step_assembled_assignments_count(next_step)
        if next_step.single and \
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
            next_departments = ProductionStep.objects.get(
                product=self.order_product.product,
                department=Department.objects.get(number=0)
            ).next_steps.all()

            for order_product in active_order_products:
                for department in next_departments:
                    assignments = Assignment.objects.filter(
                        order_product=order_product,
                        department=department,
                        assembled=False,
                    )
                    assignments.update(assembled=True)

                    self.notification_data[department.number] = {
                        'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                        'data': self.order_product.id,
                    }

        else:
            next_departments = ProductionStep.objects.get(
                product=self.order_product.product,
                department=self.department,
                is_active=True,
            ).next_steps.all()

            if not self._check_order_product_full_ready():
                for department in next_departments:
                    """
                    Итерируемся по всем последующим отделам. 
                    """

                    """Вычисляем количество нарядов к обновлению"""
                    target_size = self._get_target_size_for_activate_assignments(department)

                    if target_size:
                        """Если количество отлично от нуля переводим наряды в статус ожидает"""
                        start_position = Assignment.objects.filter(
                            order_product=self.order_product,
                            department=department,
                            assembled=True,
                        ).count()

                        last_position = start_position + target_size
                        if last_position > self.order_product.quantity:
                            last_position = self.order_product.quantity
                        numbers = [i for i in range(start_position + 1, last_position + 1)]

                        assignments = Assignment.objects.filter(
                            order_product=self.order_product,
                            department=department,
                            number__in=numbers,
                            assembled=False,
                        )
                        assignments.update(assembled=True)

                        self.notification_data[department.number] = {
                            'action': EqNotificationActions.UPDATE_TARGET_ITEM.value,
                            'data': self.order_product.id,
                        }

    def _set_technological_process_confirmed(self):
        self.order_product.product.technological_process_confirmed = self.original_user
        self.order_product.product.save()

    def _tariffication_instruction(self):
        # Флаг для отправки уведомления на обновление ЗП
        tariff_created = False
        now = datetime.now()
        if not self.department.piecework_wages:
            Assignment.objects.filter(
                id__in=self.assignment_ids,
            ).update(
                tariffication_date=now,
            )
        else:
            for assignment_id in self.assignment_ids:
                target_assignment = Assignment.objects.get(id=assignment_id)
                # Если есть тариф, и еще нет даты тарифа
                if target_assignment.new_tariff and not target_assignment.tariffication_date:
                    if target_assignment.new_tariff.amount:
                        earning = None
                        co_executors = AssignmentCoExecutor.objects.filter(
                            assignment=target_assignment
                        )
                        description = (
                            f'{target_assignment.department.name} - '
                            f'Соисполнитель ЭЛО - {self.order_product.product.name}'
                        )
                        for executor in co_executors:
                            if executor.co_executor.piecework_wages:
                                tariff_created = True
                                earning = make_earning(
                                    earning_type="ЭЛО",
                                    amount=executor.amount,
                                    user=executor.co_executor,
                                    created_by=target_assignment.inspector,
                                    approval_by=target_assignment.inspector,
                                    target_date=target_assignment.date_completion,
                                    comment=description,
                                    earning_comment=str(target_assignment),
                                )

                        description = (
                            f'{target_assignment.department.name} - '
                            f'Производство ЭЛО - '
                            f'{self.order_product.product.name}'
                        )

                        if target_assignment.amount:
                            if target_assignment.executor.piecework_wages:
                                tariff_created = True
                                earning = make_earning(
                                    user=target_assignment.executor,
                                    amount=target_assignment.amount,
                                    target_date=target_assignment.date_completion,
                                    created_by=target_assignment.inspector,
                                    approval_by=target_assignment.inspector,
                                    comment=description,
                                    earning_type="ЭЛО",
                                    earning_comment=str(target_assignment),
                                )

                        if earning is not None:
                            target_assignment.tariffication_date = earning.target_date
                        else:
                            target_assignment.tariffication_date = now

                        target_assignment.save()

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

    def _create_audit(self):
        Audit.objects.create(
            employee=self.original_user or self.employee,
            details=self._get_audit_details()
        )

    @transaction.atomic
    def execute(self):
        """Произвести обновление переданных нарядов и создать последующие"""
        """Установка конфигурации пользователей на основании заданного режима просмотра. """
        self._check_view_mode_by_id()

        """Производим обновление переданных номеров"""
        self._update_target_numbers()

        """В случае если происходит подтверждение наряда создаем связанные наряды"""
        if self.action == "confirmed":
            self._confirmation_instructions()
            self._tariffication_instruction()

        """Делаем рассылку на обновление данных в WS"""
        ws_group_updates(pin_code=self.original_user.pin_code, notification_data=self.notification_data)
        ws_update_notification(self.department.number)

        self._create_audit()
