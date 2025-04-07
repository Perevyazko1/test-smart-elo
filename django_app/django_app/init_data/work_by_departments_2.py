import openpyxl

from core.models import Assignment, OrderProduct, ProductionStep
from staff.models import Department

DATE_FROM = "2025-03-01"
DATE_TO = "2025-03-31"


def get_work_by_departments_2():
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "Work Report 2"

    target_departments = Department.objects.filter(
        is_industrial=True
    ).exclude(
        number__in=[1, 50, 0, 10, 11]
    )

    obivka: Department = Department.objects.get(
        number=2
    )
    ready_dep: Department = Department.objects.get(
        number=50
    )

    departments = []

    for department in target_departments:
        departments.append(department.name)
        departments.append("")

    sheet.append([
        "Проект",
        "Заказ",
        "Изделие",
        "Всего",
        "Цена",
        "Отдел->",
        *departments,
        "%готовности",
        "По проценту гот",
        "По завершенным",
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
    ).distinct().order_by('order__project')

    for order_product in target_order_products:
        prod_steps = ProductionStep.objects.filter(
            product=order_product.product,
            is_active=True,
            department__in=target_departments,
        )
        assignments_count_all = target_assignments.filter(
            order_product=order_product,
        ).count()

        try:
            last_ps = prod_steps.get(
                department=obivka,
            )
        except ProductionStep.DoesNotExist:
            last_ps = ProductionStep.objects.get(
                product=order_product.product,
                is_active=True,
                next_step__department=ready_dep,
            )

        final_assignments = target_assignments.filter(
            order_product=order_product,
            department=last_ps.department,
        )
        final_count = final_assignments.count()

        result = [
            order_product.order.project,
            order_product.series_id,
            order_product.product.name,
            order_product.quantity,
            order_product.price,
            final_count,
        ]

        for department in target_departments:
            if prod_steps.filter(department=department).exists():
                assignments_count = target_assignments.filter(
                    department=department,
                    order_product=order_product,
                ).count()
            else:
                assignments_count = ""

            result.append(assignments_count)
            result.append(assignments_count * int(order_product.price))

        total_percent = round(assignments_count_all / (order_product.quantity * prod_steps.count()) * 100, 2)

        result.append(total_percent)
        result.append(order_product.quantity * int(order_product.price) * total_percent / 100)
        result.append(int(order_product.price) * final_count)

        sheet.append(result)

        print(f"Добавлен отчет по {order_product.series_id}", total_percent, "%")

    # Сохраняем Excel-файл
    file_name = "work_report_2.xlsx"
    workbook.save(file_name)
    print(f"Отчет сохранен в файл: {file_name}")
