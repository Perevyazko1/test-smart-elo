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
        count_in_work = assignments.filter(status='in_work').count()
        count_all = assignments.count()
        data = {
            "count_in_work": count_in_work,
            "count_all": count_all,
            'full_name': f'{employee.first_name} {employee.last_name}'
        }
        results.append(data)
    return results
