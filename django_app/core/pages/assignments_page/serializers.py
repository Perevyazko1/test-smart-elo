"""Assignments serializers. """
from rest_framework import serializers

from core.models import Assignment, Tariff, AssignmentCoExecutor
from core.serializers import OrderProductSerializer
from staff.serializers import EmployeeSerializer, DepartmentSerializer


class AssignmentTariffSerializer(serializers.ModelSerializer):
    class Meta:
        """Meta. """
        model = Tariff
        fields = [
            'id',
            'amount',
        ]


class SimpleAssignmentSerializer(serializers.ModelSerializer):
    new_tariff = AssignmentTariffSerializer()

    class Meta:
        """Meta. """
        model = Assignment
        fields = [
            'id',
            'new_tariff',
            'executor',
            'number',
            'status',
            'inspector',
            'plane_date',
            'assembled',
            'appointed_by_boss',
        ]


class AssignmentCoExecutorSerializer(serializers.ModelSerializer):
    co_executor = EmployeeSerializer(read_only=True)

    class Meta:
        """Meta. """
        model = AssignmentCoExecutor
        fields = [
            'id',
            'co_executor',
            'amount',
            'assignment',
        ]


class AssignmentExtendedSerializer(serializers.ModelSerializer):
    executor = EmployeeSerializer()
    co_executors = AssignmentCoExecutorSerializer(source='assignmentcoexecutor_set', many=True)
    inspector = EmployeeSerializer()
    department = DepartmentSerializer()
    order_product = OrderProductSerializer()
    new_tariff = AssignmentTariffSerializer()

    class Meta:
        """Meta. """
        model = Assignment
        fields = [
            'id',
            'number',
            'co_executors',
            'notes',
            'status',
            'order_product',
            'department',
            'executor',
            'assembled',
            'inspector',
            'appointment_date',
            'date_completion',
            'inspect_date',
            'plane_date',
            'appointed_by_boss',
            'new_tariff',
        ]
