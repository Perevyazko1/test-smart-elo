import datetime

from core.models import OrderProduct, Assignment
from staff.models import Employee


class UpdateAssignments:
    @staticmethod
    def execute(
            series_id: str,
            numbers: list[int],
            department_number: int,
            action: str,
            pin_code: int):

        print('Обновление нарядов')

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
