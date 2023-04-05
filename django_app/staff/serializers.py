from .models import Employee, Department, Transaction
from rest_framework import serializers


class DepartmentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Department
        fields = [
            'id',
            'name',
            'number',
            'single',
            'piecework_wages',
        ]


class EmployeeSerializer(serializers.ModelSerializer):
    departments = DepartmentSerializer(many=True)
    current_department = DepartmentSerializer(many=False)

    class Meta:
        model = Employee
        fields = [
            'id',
            'first_name',
            'last_name',
            'username',
            'departments',
            'current_department',
            'pin_code'
        ]
        read_only_fields = [
            'id',
            'username',
            'pin_code'
        ]


class TransactionSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'commit_date',
            'transaction_type',
            'details',
            'amount',
            'employee',
            'inspector',
        ]
