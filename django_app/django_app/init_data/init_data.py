"""Initial methods and scripts. """
from datetime import datetime, timedelta
import re

from django.core.exceptions import ObjectDoesNotExist

from core.models import AssignmentCoExecutor, Assignment
from staff.models import Department, Transaction


def find_assignment_by_string(input_string):
    # Регулярное выражение для извлечения данных
    pattern = r'№(\d+) - \{(\d+)\}(\d+)\s+(\w+)'
    match = re.search(pattern, input_string)

    if not match:
        return None  # Если строка не соответствует формату

    # Извлечение данных из строки
    assignment_number = int(match.group(1))
    series_prefix = match.group(2)
    series_id = match.group(3)
    department_name = match.group(4)

    # Полный series_id (можно уточнить формат, если есть префиксы)
    full_series_id = f"{{{series_prefix}}}{series_id}"

    try:
        # Поиск отдела
        department = Department.objects.get(name=department_name)

        # Поиск наряда
        assignment = Assignment.objects.get(
            number=assignment_number,
            order_product__series_id=full_series_id,
            department=department
        )

        return assignment  # Возвращаем найденный объект Assignment

    except ObjectDoesNotExist:
        return None


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    # TODO скрипт за последний месяц пересчитать наряды по сдельщикам которые были на окладе
    result = {}
    today = datetime.now()
    target_month = today - timedelta(days=30)

    target_transactions = Transaction.objects.filter(
        add_date__gte=target_month,
        inspect_date__isnull=True,
        inspector__isnull=False
    )

    for transaction in target_transactions:
        assignment = find_assignment_by_string(transaction.description)

        if assignment:
            result[f'id{transaction.id}'] = f"Наряд найден: {assignment}"

            if assignment.executor.piecework_wages:
                co_executors = AssignmentCoExecutor.objects.filter(
                    assignment=assignment
                )
                difference = 0
                for co_executor in co_executors:
                    difference += co_executor.amount

                transaction.amount = assignment.new_tariff.amount - difference
                transaction.inspect_date = transaction.add_date
                transaction.save()
        else:
            result[f'id{transaction.id}'] = f"Наряд не найден {transaction.description}"

    return result
