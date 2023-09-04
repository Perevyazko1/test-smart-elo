from django.contrib.auth.models import Group

from rest_framework import serializers

from .models import Employee, Department, Transaction, Audit


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = [
            'name'
        ]


class DepartmentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Department
        fields = [
            'id',
            'name',
            'number',
            'color',
            'single',
            'piecework_wages',
        ]


class EmployeeSerializer(serializers.ModelSerializer):
    departments = DepartmentSerializer(many=True)
    current_department = DepartmentSerializer(many=False)
    groups = GroupSerializer(many=True)

    class Meta:
        model = Employee
        fields = [
            'id',
            'first_name',
            'last_name',
            'username',
            'departments',
            'current_department',
            'pin_code',
            'groups',
        ]
        read_only_fields = [
            'id',
            'username',
            'pin_code',
            'groups',
        ]


class AuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = [
            'date',
            'audit_type',
            'details'
        ]
