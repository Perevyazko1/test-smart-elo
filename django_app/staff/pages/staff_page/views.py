from django.http import JsonResponse
from django.db.models import Sum, Min, Max, Q

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.filters import OrderingFilter

from core.models import Assignment, ProductPicture, AssignmentCoExecutor
from staff.models import Employee, Transaction

from .lib.range_info import get_range_info

from .serializers import StaffInfoSerializer, TransactionSerializer
from .filters import StaffInfoModelFilter, TransactionModelFilter


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


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filterset_class = TransactionModelFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['inspector']

    def update(self, request, *args, **kwargs):
        # Переопределяем обновление объекта, что бы он возвращал полный объект
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return self.retrieve(request, *args, **kwargs)


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
                inspect_date__gte=date_from,
                inspect_date__lte=date_by,
            ) |
            Q(
                executor=employee,
                inspect_date__gte=date_from,
                inspect_date__lte=date_by,
            )
        )
    else:
        assignments = Assignment.objects.filter(
            Q(
                co_executors__co_executor=employee,
                tariffication_date__gte=date_from,
                tariffication_date__lte=date_by,
            ) |
            Q(
                executor=employee,
                tariffication_date__gte=date_from,
                tariffication_date__lte=date_by,
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


@api_view(['POST'])
def confirm_transactions(request):
    start_date = request.data.get('start_date', None)
    end_date = request.data.get('end_date', None)
    by_target_date = request.data.get('by_target_date', None)
    ids: [] = request.data.get('ids', None)
    target_list = request.data.get('target_list', None)
    wages_only = request.data.get('wages_only', None)

    user = request.user

    if None in [start_date, end_date, by_target_date, ids, target_list, wages_only]:
        return JsonResponse({'error': 'Не корректные данные запроса'}, status=404)

    target_ids = []

    attention_users = Employee.objects.filter(
        attention=True
    )

    for user_id in ids:
        if attention_users.filter(id=user_id).exists():
            continue
        target_ids.append(user_id)

    filter_params = {
        "inspector__isnull": True,
        f"{'target_date' if by_target_date else 'add_date'}__gte": start_date,
        f"{'target_date' if by_target_date else 'add_date'}__lte": end_date,
        "employee__id__in": target_ids,
        "transaction_type__in": ['accrual', 'debiting'] if target_list == 'wages' else ['cash', 'card', 'tax']
    }

    if wages_only:
        filter_params['details__in'] = ['wages', 'prize', 'fine']

    target_transactions = Transaction.objects.filter(
        **filter_params
    )

    for transaction in target_transactions:
        transaction.inspector = user
        transaction.save()

    return JsonResponse({'result': 'ok'}, json_dumps_params={"ensure_ascii": False})
