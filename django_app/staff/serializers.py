from django.contrib.auth.models import Group
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import Employee, Department, Audit


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
    boss = serializers.SerializerMethodField()
    current_department = DepartmentSerializer(many=False)
    permanent_department = DepartmentSerializer(many=False)
    groups = GroupSerializer(many=True)
    token = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id',
            'first_name',
            'last_name',
            'username',
            'departments',
            'boss',
            'current_department',
            'permanent_department',
            'pin_code',
            'groups',
            'token',
        ]
        read_only_fields = [
            'id',
            'username',
            'boss',
            'pin_code',
            'groups',
            'token',
        ]

    def get_token(self, obj):
        token, created = Token.objects.get_or_create(user=obj)
        return token.key

    def get_boss(self, obj):
        if obj.boss:
            return EmployeeSerializer(obj.boss, context=self.context).data
        return None


class AuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = [
            'date',
            'audit_type',
            'details'
        ]
