import openpyxl
from django.db.models import Sum

from core.models import Assignment, OrderProduct, AssignmentCoExecutor
from staff.models import Department, Employee

DATE_FROM = "2025-04-01"
DATE_TO = "2025-06-30"


def constructing_report():
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "constructing_report"

    constr: Department = Department.objects.get(
        number=1
    )

    sheet.append([
        "Проект",
        "Заказ",
        "Заказ (клиента)",
        "Изделие",
        "Цена",
        "Дата",
        "Исполнитель",
    ])

    target_assignments = Assignment.objects.filter(
        date_completion__date__gte=DATE_FROM,
        date_completion__date__lte=DATE_TO,
        department=constr,
    ).select_related(
        'order_product__product', 'order_product__order', 'department'
    )

    for assignment in target_assignments:
        result = [
            assignment.order_product.order.project,
            assignment.order_product.series_id,
            assignment.order_product.order.inner_number,
            assignment.order_product.product.name,
            assignment.order_product.price,
            assignment.date_completion.date(),
            str(assignment.executor),
        ]

        sheet.append(result)

        print(f"Добавлен отчет по {assignment.order_product.series_id}")

    # Сохраняем Excel-файл
    file_name = "constructing_report.xlsx"
    workbook.save(file_name)
    print(f"Отчет сохранен в файл: {file_name}")
