import openpyxl
from django.db.models import Sum

from core.models import Assignment, OrderProduct, AssignmentCoExecutor
from staff.models import Department, Employee

DATE_FROM = "2025-03-01"
DATE_TO = "2025-03-31"


def upholstery_report():
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "Upholstery Report"

    obivka: Department = Department.objects.get(
        number=2
    )

    sheet.append([
        "Проект",
        "Заказ",
        "Изделие",
        "Всего",
        "Цена",
        "Отдел->",
        "Количество",
        "Сделка",
    ])

    target_assignments = Assignment.objects.filter(
        date_completion__date__gte=DATE_FROM,
        date_completion__date__lte=DATE_TO,
        department=obivka,
    ).select_related(
        'order_product__product', 'order_product__order', 'department'
    )

    target_order_products = OrderProduct.objects.filter(
        assignments__in=target_assignments,
    ).distinct().order_by('order__project')

    for order_product in target_order_products:
        assignments = target_assignments.filter(
            order_product=order_product,
        )
        co_executors  = AssignmentCoExecutor.objects.filter(
            assignment__in=assignments,
        )

        result = [
            order_product.order.project,
            order_product.series_id,
            order_product.product.name,
            order_product.quantity,
            order_product.price,
            "",
        ]

        assignments_sum = assignments.aggregate(total_amount=Sum('amount'))['total_amount'] or 0
        co_executors_sum = co_executors.aggregate(total_amount=Sum('amount'))['total_amount'] or 0


        result.append(assignments.count())
        result.append(assignments_sum + co_executors_sum)

        sheet.append(result)

        print(f"Добавлен отчет по {order_product.series_id}", assignments.count(), "шт")

    while target_assignments.count():
        assignment = target_assignments.first()

        user = assignment.executor

        assignments = target_assignments.filter(
            executor=user,
        )
        co_executors = AssignmentCoExecutor.objects.filter(
            assignment__in=assignments,
        )

        assignments_price = assignments.aggregate(total_amount=Sum('order_product__price'))['total_amount'] or 0

        row = [
            f"{user.first_name} {user.last_name}",
            assignments.count(),
            co_executors.count(),
            assignments_price,
        ]
        sheet.append(row)
        target_assignments = target_assignments.exclude(executor=user)

    # Сохраняем Excel-файл
    file_name = "upholstery_report.xlsx"
    workbook.save(file_name)
    print(f"Отчет сохранен в файл: {file_name}")
