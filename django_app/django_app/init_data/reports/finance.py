from django.db.models import F
import openpyxl

from core.models import Assignment, OrderProduct

DATE_FROM = '2026-01-01'
DATE_TO = '2026-01-31'


def get_finance_report():
    """Получение детализации по выпущенной продукции"""
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "finance_report"

    sheet.append([
        "Проект",
        "Заказ",
        "Заказ (клиента)",
        "Изделие",
        "Цена",
        "Дата",
        "№Наряда",
        "Отдел",
        "Исполнитель",
    ])

    assignments = Assignment.objects.filter(
        inspect_date__gte=DATE_FROM,
        inspect_date__lte=DATE_TO,
        department=F('order_product__product__technological_process__final_department')
    ).select_related(
        'order_product__order',
        'order_product__product',
        'department',
        'executor'
    )

    for assignment in assignments:
        result = [
            assignment.order_product.order.project,
            assignment.order_product.order.number,
            assignment.order_product.order.inner_number,
            assignment.order_product.product.name,
            assignment.order_product.price,
            assignment.inspect_date.date(),
            assignment.number,
            assignment.department.name,
            assignment.executor.get_full_name() if assignment.executor else "",
        ]

        sheet.append(result)

    # Сохраняем Excel-файл
    file_name = "finance.xlsx"
    workbook.save(file_name)

