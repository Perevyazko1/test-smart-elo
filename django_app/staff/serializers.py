import string
import random

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
    departments = DepartmentSerializer(many=True, read_only=True)
    current_department = DepartmentSerializer(many=False, read_only=True)
    permanent_department = DepartmentSerializer(many=False, read_only=True)
    groups = GroupSerializer(many=True, read_only=True)
    token = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id',
            'first_name',
            'last_name',
            'patronymic',
            'username',
            'departments',
            'description',
            'boss',
            'current_department',
            'current_balance',
            'permanent_department',
            'favorite_users',
            'pin_code',
            'attention',
            'is_active',
            'groups',
            'piecework_wages',

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


class AuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = [
            'date',
            'audit_type',
            'details'
        ]


class CreateUserSerializer(serializers.ModelSerializer):
    departments = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), many=True, required=False
    )
    permanent_department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), allow_null=True, required=False
    )

    class Meta:
        model = Employee
        fields = ['first_name', 'last_name', 'patronymic', 'pin_code',
                  'departments', 'permanent_department',
                  'is_active', 'piecework_wages', 'description',
                  'attention']

    def create(self, validated_data):
        # Генерация username и пароля
        username = self.generate_username(
            validated_data.get('first_name', ''),
            validated_data.get('last_name', ''),
        )
        password = self.generate_password()

        departments_data = validated_data.pop('departments')
        validated_data['current_department'] = validated_data.get('permanent_department')

        employee = Employee.objects.create(username=username, **validated_data)
        employee.set_password(password)

        employee.departments.set(departments_data)

        self.assign_default_groups(employee)

        employee.save()

        return employee

    def generate_username(self, first_name: str, last_name: str) -> str:
        """Генерация уникального username на основе имени и фамилии"""
        base_username = (first_name[:1] + last_name).lower() if first_name and last_name else 'user'
        username = base_username

        # Проверяем уникальность
        count = 1
        while Employee.objects.filter(username=username).exists():
            username = f"{base_username}{count}"
            count += 1

        return username

    def generate_password(self, length: int = 8) -> str:
        """Генерация случайного пароля"""
        characters = string.ascii_letters + string.digits
        return ''.join(random.choice(characters) for _ in range(length))

    def assign_default_groups(self, employee: Employee):
        """Добавляем пользователя в группы 'Страница ЭЛО' и 'Страница задач'"""
        elo_group, _ = Group.objects.get_or_create(name='Страница ЭЛО')
        tasks_group, _ = Group.objects.get_or_create(name='Страница задач')

        employee.groups.add(elo_group, tasks_group)

    def update(self, instance, validated_data):
        # Проверяем и обновляем только переданные данные
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.description = validated_data.get('description', instance.description)
        instance.patronymic = validated_data.get('patronymic', instance.patronymic)
        instance.pin_code = validated_data.get('pin_code', instance.pin_code)
        instance.attention = validated_data.get('attention', instance.attention)

        # Обновление отделов (если переданы)
        departments_data = validated_data.get('departments', None)
        if departments_data is not None:
            instance.departments.set(departments_data)

        instance.permanent_department = validated_data.get('permanent_department', instance.permanent_department)

        # Обновление статуса активности и формы оплаты
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.piecework_wages = validated_data.get('piecework_wages', instance.piecework_wages)

        instance.save()

        return instance
