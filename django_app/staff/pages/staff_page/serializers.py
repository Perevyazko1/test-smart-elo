from copy import deepcopy
from rest_framework import serializers

from staff.models import Employee


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

        for key, value in range_info.items():
            result[key]['accrual'] = 0
            result[key]['pre_accrual'] = 0
            result[key]['debit'] = 0
            result[key]['pre_debit'] = 0
            result[key]['no_confirmed'] = 0

        return result
