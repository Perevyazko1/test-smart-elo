import openpyxl

from core.models import Assignment, OrderProduct

DATE_FROM = '2025-12-01'
DATE_TO = '2025-12-31'


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

    order_products = OrderProduct.objects.filter(
        assignments__inspect_date__gte=DATE_FROM,
        assignments__inspect_date__lte=DATE_TO,
    )

    while order_products:
        product = order_products.first().product
        final_department = product.technological_process.final_department

        target_ops = order_products.filter(
            product=product,
        )
        assignments = Assignment.objects.filter(
            order_product__in=target_ops,
            department=final_department,
            inspect_date__gte=DATE_FROM,
            inspect_date__lte=DATE_TO,
        )
        for assignment in assignments:
            result = [
                assignment.order_product.order.project,
                assignment.order_product.order.number,
                assignment.order_product.order.inner_number,
                product.name,
                assignment.order_product.price,
                assignment.inspect_date.date(),
                assignment.number,
                assignment.department.name,
                assignment.executor.get_full_name(),
            ]

            sheet.append(result)

        order_products = order_products.exclude(
            product=product,
        )

    # Сохраняем Excel-файл
    file_name = "finance.xlsx"
    workbook.save(file_name)

