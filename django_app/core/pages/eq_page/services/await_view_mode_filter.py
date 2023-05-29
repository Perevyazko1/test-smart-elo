from core.models import Assignment
from staff.models import Department


def await_view_mode_filter(queryset, view_mode, department_number):
    if view_mode == "0" or len(view_mode) == 6:
        queryset = queryset.filter(
            assignments__status__in=['await', 'in_work'],
            assignments__department__number=department_number
        )

    if view_mode == '1':
        queryset = queryset.filter(status="0")
        department = Department.objects.get(number=department_number)

        if not department_number == '1':
            queryset = queryset.filter(
                product__technological_process__schema__icontains=department.name,
            )

        for order_product in queryset:
            assignments_count = Assignment.objects.filter(
                order_product=order_product,
                department=department,
                status='ready'
            ).count()

            if (department.single and assignments_count) or (order_product.quantity == assignments_count):
                queryset = queryset.exclude(series_id=order_product.series_id)

    if view_mode == '2':
        queryset = queryset.filter(status="0")
        department = Department.objects.get(number=department_number)

        if not department_number == '1':
            queryset = queryset.filter(
                product__technological_process__schema__icontains=department.name,
            )

        for order_product in queryset:
            assignments_count = Assignment.objects.filter(
                order_product=order_product,
                department=department,
                status='ready'
            ).count()
            if not ((department.single and assignments_count) or (order_product.quantity == assignments_count)):
                queryset = queryset.exclude(series_id=order_product.series_id)

    return queryset
