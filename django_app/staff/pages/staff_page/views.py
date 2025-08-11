from django.db.models import Sum, Min, Max, Q
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import api_view

from core.models import Assignment, ProductPicture, AssignmentCoExecutor
from staff.models import Employee
from .filters import StaffInfoModelFilter
from .lib.range_info import get_range_info
from .serializers import StaffInfoSerializer


class StaffInfoViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = StaffInfoSerializer
    filterset_class = StaffInfoModelFilter

    def get_serializer_context(self):
        context = super().get_serializer_context()
        start_date = self.request.query_params.get('start_date') or None
        end_date = self.request.query_params.get('end_date') or None

        context['range_info'] = get_range_info(start_date, end_date)
        return context


@api_view(['GET'])
def get_assignment_counts(request):
    employee__id = request.query_params.get('employee__id')
    date_from = request.query_params.get('date_from')
    date_by = request.query_params.get('date_by')
    select_by_visa = request.query_params.get('select_by_visa')

    try:
        employee = Employee.objects.get(id=employee__id)
    except Employee.DoesNotExist:
        return JsonResponse({'error': 'Employee not found'}, status=404)

    # Получаем все наряды, где пользователь был исполнителем или соисполнителем
    if select_by_visa == "true":
        assignments = Assignment.objects.filter(
            Q(
                co_executors__co_executor=employee,
                inspect_date__date__gte=date_from,
                inspect_date__date__lte=date_by,
            ) |
            Q(
                executor=employee,
                inspect_date__date__gte=date_from,
                inspect_date__date__lte=date_by,
            )
        )
    else:
        assignments = Assignment.objects.filter(
            Q(
                co_executors__co_executor=employee,
                tariffication_date__date__gte=date_from,
                tariffication_date__date__lte=date_by,
            ) |
            Q(
                executor=employee,
                tariffication_date__date__gte=date_from,
                tariffication_date__date__lte=date_by,
            )
        )

    data = []
    while assignments.exists():
        assignment = assignments.first()
        pictures = ProductPicture.objects.filter(
            product=assignment.order_product.product
        )
        thumbnail_urls = []
        picture_urls = []

        for picture in pictures:
            thumbnail_urls.append(picture.thumbnail.url)
            picture_urls.append(picture.image.url)

        executor_assignments = assignments.filter(
            executor=employee,
            order_product__product=assignment.order_product.product,
            department=assignment.department,
        )

        co_executor_assignments = assignments.filter(
            co_executors__co_executor=employee,
            order_product__product=assignment.order_product.product,
            department=assignment.department,
        )
        # Вычисляем минимальный и максимальный размер amount для данной группы
        executor_amount_range = executor_assignments.aggregate(
            min_amount=Min('amount'),
            max_amount=Max('amount')
        )

        employee_co_executors = AssignmentCoExecutor.objects.filter(
            assignment__in=co_executor_assignments,
            co_executor=employee
        )

        co_executor_amount_range = employee_co_executors.aggregate(
            min_amount=Min('amount'),
            max_amount=Max('amount')
        )
        # Убираем нули из минимального значения
        min_amounts = [amount for amount in [
            executor_amount_range['min_amount'],
            co_executor_amount_range['min_amount']
        ] if amount and amount != 0]

        # Если все минимальные значения — 0, используем минимальное ненулевое значение или None
        min_amount = min(min_amounts, default=None)

        max_amount = max(executor_amount_range['max_amount'] or 0, co_executor_amount_range['max_amount'] or 0)

        # Если минимальное значение None (все amount были 0), то используем только максимальное
        if min_amount is None:
            amount_result = max_amount
        else:
            # Если минимум и максимум равны, выводим только одно значение, иначе диапазон
            amount_result = max_amount if min_amount == max_amount else f"{min_amount} - {max_amount}"

        total_amount = (executor_assignments.aggregate(Sum('amount'))['amount__sum'] or 0) + \
                       (employee_co_executors.aggregate(Sum('amount'))['amount__sum'] or 0)

        data.append(
            {
                'product_name': assignment.order_product.product.name,
                'department_name': assignment.department.name,
                'count': executor_assignments.count(),
                'co_executor_count': co_executor_assignments.count(),
                'amount_range': amount_result,
                'total_amount': total_amount,
                'thumbnail_urls': thumbnail_urls,
                'picture_urls': picture_urls,
            }
        )
        assignments = assignments.exclude(
            order_product__product=assignment.order_product.product,
            department=assignment.department,
        )

    return JsonResponse({'results': data}, json_dumps_params={"ensure_ascii": False})
