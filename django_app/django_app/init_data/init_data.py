"""Initial methods and scripts."""
# from core.models import Assignment
# from staff.models import Department, Employee, Transaction
# from tasks.models import Task


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    # TARGET_DATE = "2025-05-19"
    # NEW_DATE = "2025-05-16"
    # target_department = Department.objects.get(name="Сборка")
    #
    # target_users=Employee.objects.filter(
    #     departments=target_department.id,
    # )
    #
    # target_assignments = Assignment.objects.filter(
    #     tariffication_date__date=TARGET_DATE,
    #     department=target_department,
    # )
    #
    # target_assignments.update(
    #     tariffication_date=NEW_DATE,
    # )
    #
    # target_tasks = Task.objects.filter(
    #     verified_at__date=TARGET_DATE,
    #     new_executor__employee__in=target_users,
    # )
    #
    # target_tasks.update(
    #     verified_at=NEW_DATE,
    # )
    #
    # target_payments = Transaction.objects.filter(
    #     target_date__date=TARGET_DATE,
    #     employee__in=target_users,
    # )
    #
    # target_payments.update(
    #     target_date=NEW_DATE,
    # )
    #
    #
    # print('PASS')
    return f"Oki"
