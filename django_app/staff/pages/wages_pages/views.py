from dataclasses import asdict

from django.db.models import Sum, Min, Max, Q
from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response

from core.models import Assignment, ProductPicture, AssignmentCoExecutor
from core.services.get_week_info import GetWeekInfo
from staff.models import Employee, Transaction
from staff.pages.wages_pages.filters import EmployeeModelFilter, TransactionModelFilter
from staff.pages.wages_pages.serializers import WagesSerializer, TransactionSerializer
from staff.pages.wages_pages.services import get_weeks_list_info


class WagesViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = WagesSerializer
    filterset_class = EmployeeModelFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['first_name']

    def list(self, request, *args, **kwargs):
        week_info = get_weeks_list_info()
        total_data = {}

        total_balance = Employee.objects.all().aggregate(Sum('current_balance'))['current_balance__sum']
        total_data['Баланс'] = {
            'total_accrual': total_balance,
            'total_wages': total_balance,
            'confirmed': False,
            'week': '',
            'year': '',
        }

        for week in week_info:
            print(f'###PRINT list #l=>40:', week.date_range[0], week.date_range[1])
            transactions = Transaction.objects.filter(
                add_date__gte=week.date_range[0],
                add_date__lte=week.date_range[1],
            )
            total_wages = transactions.exclude(transaction_type='accrual').aggregate(Sum('amount'))['amount__sum']
            total_accrual = transactions.filter(transaction_type='accrual').aggregate(Sum('amount'))['amount__sum']
            has_uninspected = transactions.filter(inspector__isnull=True).exists()

            total_data[f'Нед.{week.week}'] = {
                'total_accrual': total_accrual,
                'total_wages': total_wages,
                'confirmed': not has_uninspected,
                'week': week.week,
                'year': week.year,
            }

        serializer = self.get_serializer(self.filter_queryset(self.get_queryset()), many=True)

        return Response({'detailed_data': serializer.data, 'total_data': total_data})


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
def get_wages_week_info(request):
    week = request.query_params.get('week')
    year = request.query_params.get('year')
    employee__id = request.query_params.get('employee__id')
    week_srt_days = [
        "ПН.",
        "ВТ.",
        "СР.",
        "ЧТ.",
        "ПТ.",
        "СБ.",
        "ВС.",
    ]
    earned_per_week = {}

    target_week_info = GetWeekInfo(week=week, year=year).execute()

    for i, week_day in enumerate(week_srt_days):
        transaction = Transaction.objects.filter(
            employee__id=employee__id,
            add_date__date=target_week_info.dt_dates[i],
        )
        accruals = transaction.filter(transaction_type='accrual').aggregate(Sum('amount'))['amount__sum'] or 0
        debit = transaction.exclude(transaction_type='accrual').aggregate(Sum('amount'))['amount__sum'] or 0
        confirmed = transaction.filter(inspector__isnull=True).exists()

        earned_per_week[week_day] = {
            'accruals': accruals,
            'debit': debit,
            'confirmed': not confirmed,
        }

    return JsonResponse({
        'target_week_info': asdict(target_week_info),
        'earned_per_week': earned_per_week,
    }, json_dumps_params={"ensure_ascii": False})


@api_view(['GET'])
def get_assignment_counts(request):
    employee__id = request.query_params.get('employee__id')
    date_from = request.query_params.get('date_from')
    date_by = request.query_params.get('date_by')
    select_by_visa = request.query_params.get('select_by_visa')

    print(f'###PRINT get_assignment_counts #l=>125:', select_by_visa)

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
