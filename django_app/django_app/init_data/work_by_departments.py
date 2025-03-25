import openpyxl
from core.models import Assignment, Product, OrderProduct, ProductionStep
from staff.models import Department

DATE_FROM = "2025-02-01"
DATE_TO = "2025-02-28"


def get_work_by_departments():
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "Work Report"

    target_departments = Department.objects.filter(
        is_industrial=True
    ).exclude(
        number__in=[1, 50, 0]
    )

    ready_department = Department.objects.get(
        number=50
    )

    departments = []

    for department in target_departments:
        departments.append(department.name)
        departments.append("")

    sheet.append([
        "Изделие",
        "Проект",
        "Заказ",
        "Всего",
        *departments
    ])

    target_assignments = Assignment.objects.filter(
        date_completion__date__gte=DATE_FROM,
        date_completion__date__lte=DATE_TO,
        department__in=target_departments,
    ).select_related(
        'order_product__product', 'order_product__order', 'department'
    )

    target_order_products = OrderProduct.objects.filter(
        assignments__in=target_assignments,
    ).distinct()

    target_products = Product.objects.filter(
        order_products__in=target_order_products
    ).distinct()

    for product in target_products:
        last_ps = ProductionStep.objects.get(
            product=product,
            is_active=True,
            next_step__department=ready_department,
        )

        final_assignments = target_assignments.filter(
            order_product__product=product,
            department=last_ps.department,
        )

        final_count = final_assignments.count()
        final_amount = 0
        for assignment in final_assignments:
            final_amount += assignment.order_product.price

        result = [
            product.name,
            "",
            final_amount if final_amount > 0 else "",
            final_count if final_count > 0 else ""
        ]

        for department in target_departments:
            assignments_count = target_assignments.filter(
                department=department,
                order_product__product=product,
            ).count()

            result.append(assignments_count if assignments_count > 0 else "")
            result.append("")
        sheet.append(result)

        order_products = target_order_products.filter(
            product=product
        ).distinct()
        for order_product in order_products:
            result_op = [
                "",
                order_product.order.project,
                order_product.order.number,
                order_product.quantity
            ]
            for department in target_departments:
                assignments_count = target_assignments.filter(
                    department=department,
                    order_product=order_product,
                ).count()
                result_op.append(assignments_count if assignments_count > 0 else "")
                result_op.append(order_product.price * assignments_count if assignments_count > 0 else "")
            sheet.append(result_op)
            print(f"Добавлен отчет по {order_product.series_id}")

    # Сохраняем Excel-файл
    file_name = "work_report.xlsx"
    workbook.save(file_name)
    print(f"Отчет сохранен в файл: {file_name}")
