from copy import deepcopy
from datetime import datetime

from django.db.models import Sum
from rest_framework import serializers

from staff.lib.get_earned_sum import get_earned_sum
from staff.models import Employee, Transaction


class StaffInfoSerializer(serializers.ModelSerializer):
    user_total_info = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id',
            'description',
            'piecework_wages',
            'user_total_info',
        ]

    def get_user_total_info(self, obj: Employee):
        range_info: dict = self.context.get('range_info')
        result = deepcopy(range_info)

        request = self.context.get('request', {})

        by_target_date = True
        wages_only = False
        if request:
            wages_only = bool(request.query_params.get('wages_only', False))
            by_target_date = not bool(request.query_params.get('by_target_date'))

        for key, value in range_info.items():
            total_info = get_earned_sum(obj,
                                        value["date_range"]["start_date"],
                                        value["date_range"]["end_date"],
                                        by_target_date,
                                        wages_only)

            result[key]['accrual'] = total_info.get('total_wages', 0)
            result[key]['pre_accrual'] = total_info.get('total_pre_wages', 0)
            result[key]['debit'] = total_info.get('total_debit', 0)
            result[key]['pre_debit'] = total_info.get('total_pre_debit', 0)
            result[key]['no_confirmed'] = total_info.get('no_confirmed', False)

        return result


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id',
            'add_date',
            'target_date',
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
            'created_automatically',
        ]

    def create(self, validated_data):
        if 'target_date' not in validated_data or validated_data['target_date'] is None:
            validated_data['target_date'] = datetime.now()  # Установить текущую дату и время

        return super().create(validated_data)
