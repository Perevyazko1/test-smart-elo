from core.models import Assignment
from staff.models import Employee


def get_eq_card_department_info(order_product, department_number):
    employees = Employee.objects.filter(
        departments__number=department_number,
    ).exclude(
        username='root',
    )
    results = []
    for employee in employees:
        assignments = Assignment.objects.filter(
                executor=employee,
                order_product=order_product,
                department__number=department_number,
            )
        count_all = assignments.count()
        if count_all == 0:
            continue
        count_in_work = assignments.filter(status='in_work').count()
        last_name = employee.last_name[0] if employee.last_name else ""
        first_name = employee.first_name[0] if employee.first_name else ""
        patronymic = employee.patronymic[0] if employee.patronymic else ""
        data = {
            "count_in_work": count_in_work,
            "count_all": count_all,
            'full_name': f'{last_name}{first_name}{patronymic}'
        }
        results.append(data)
    return results
