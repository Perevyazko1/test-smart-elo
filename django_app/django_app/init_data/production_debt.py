import openpyxl

from core.models import Assignment, OrderProduct, ProductionStep
from staff.models import Department


def production_debt():
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "Debt Report"

    target_departments = Department.objects.filter(
        is_industrial=True
    ).exclude(
        number__in=[50, 0, 10, 11]
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
        "% не гот",
        "Сумма по %",
        "По завершенным",
    ])

    target_assignments = Assignment.objects.filter(
        date_completion__isnull=True,
        department__in=target_departments,
    ).select_related(
        'order_product__product', 'order_product__order', 'department'
    )

    obivka: Department = Department.objects.get(
        number=2
    )
    ready_dep: Department = Department.objects.get(
        number=50
    )
    constr_dep: Department = Department.objects.get(
        number=1
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
        op_departments = Department.objects.filter(
            productionstep__in=prod_steps,
        )

        op_assignments = target_assignments.filter(
            order_product=order_product,
            department__in=op_departments
        )

        if prod_steps.count() == 1 and prod_steps.first().department == constr_dep:
            last_ps = prod_steps.first()
        else:
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

        if op_assignments.filter(department=constr_dep).exists():
            total_percent = 100
        else:
            no_constr_prod_steps_count = prod_steps.exclude(department=constr_dep).count()
            no_constr_assignments_count = op_assignments.exclude(department=constr_dep).count()
            total_percent = round(
                no_constr_assignments_count / (order_product.quantity * no_constr_prod_steps_count) * 100,
                2
            )

        result.append(total_percent)
        result.append(order_product.quantity * int(order_product.price) * total_percent / 100)
        result.append(int(order_product.price) * final_count)

        sheet.append(result)

        print(f"Добавлен отчет по {order_product.series_id}", total_percent, "%")

    # Сохраняем Excel-файл
    file_name = "work_report_2.xlsx"
    workbook.save(file_name)
    print(f"Отчет сохранен в файл: {file_name}")
