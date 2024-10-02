"""Assignments serializers. """
from rest_framework import serializers

from core.models import Assignment, Tariff, AssignmentCoExecutor
from core.serializers import OrderProductSerializer
from staff.serializers import DepartmentSerializer


class AssignmentTariffSerializer(serializers.ModelSerializer):
    class Meta:
        """Meta. """
        model = Tariff
        fields = [
            'id',
            'amount',
        ]


class SimpleCoExecutorSerializer(serializers.ModelSerializer):
    class Meta:
        """Meta. """
        model = AssignmentCoExecutor
        fields = [
            'id',
            'co_executor',
            'amount',
            'assignment',
        ]


class SimpleAssignmentSerializer(serializers.ModelSerializer):
    new_tariff = AssignmentTariffSerializer()
    co_executors = SimpleCoExecutorSerializer(many=True)

    class Meta:
        """Meta. """
        model = Assignment
        fields = [
            'id',
            'amount',
            'new_tariff',
            'executor',
            'number',
            'status',
            'inspector',
            'plane_date',
            'assembled',
            'appointed_by_boss',
            'co_executors'
        ]


class AssignmentCoExecutorSerializer(serializers.ModelSerializer):
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
    co_executors = AssignmentCoExecutorSerializer(many=True)
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
