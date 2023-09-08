from django.db.models import Sum
from rest_framework import serializers

from staff.models import Employee, Transaction
from staff.pages.wages_pages.services import get_weeks_list_info
from staff.serializers import DepartmentSerializer, EmployeeSerializer


class WagesSerializer(serializers.ModelSerializer):
    weeks_info = serializers.SerializerMethodField()
    departments = DepartmentSerializer(read_only=True, many=True)

    class Meta:
        model = Employee
        fields = [
            'id',
            'first_name',
            'last_name',
            'weeks_info',
            'departments',
            'description',
            'current_balance',
        ]

    def get_weeks_info(self, obj):
        week_info = get_weeks_list_info()
        result = {}
        for week in week_info:
            transactions = Transaction.objects.filter(
                employee=obj,
                add_date__gt=week.date_range[0],
                add_date__lte=week.date_range[1],
            )
            total_wages = transactions.exclude(transaction_type='accrual').aggregate(Sum('amount'))['amount__sum']
            total_accrual = transactions.filter(transaction_type='accrual').aggregate(Sum('amount'))['amount__sum']
            has_uninspected = transactions.filter(inspector__isnull=True).exists()

            result[f'Нед. {week.week}'] = {
                'total_accrual': total_accrual,
                'total_wages': total_wages,
                'confirmed': not has_uninspected,
                'week': week.week,
                'year': week.year,
            }

        return result


class TransactionSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    executor = EmployeeSerializer(read_only=True)
    inspector = EmployeeSerializer(read_only=True)
    employee_id = serializers.IntegerField(write_only=True)
    executor_id = serializers.IntegerField(write_only=True)
    inspector_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Transaction
        fields = [
            'id',
            'add_date',
            'transaction_type',
            'details',
            'amount',
            'starting_balance',
            'ending_balance',
            'inspect_date',
            'description',
            'is_locked',
            'employee',
            'executor',
            'inspector',
            'employee_id',
            'executor_id',
            'inspector_id',
        ]
