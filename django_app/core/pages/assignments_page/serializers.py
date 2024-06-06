"""Assignments serializers. """
from rest_framework import serializers

from core.models import Assignment
from core.serializers import OrderProductSerializer
from staff.serializers import EmployeeSerializer, DepartmentSerializer


class SimpleAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        """Meta. """
        model = Assignment
        fields = [
            'id',
            'number',
            'status',
            'inspector',
            'appointed_by_boss',
        ]


class AssignmentExtendedSerializer(serializers.ModelSerializer):
    executor = EmployeeSerializer()
    inspector = EmployeeSerializer()
    department = DepartmentSerializer()
    order_product = OrderProductSerializer()

    class Meta:
        """Meta. """
        model = Assignment
        fields = [
            'id',
            'number',
            'notes',
            'status',
            'order_product',
            'department',
            'executor',
            'inspector',
            'appointment_date',
            'date_completion',
            'inspect_date',
            'plane_date',
            'appointed_by_boss',
        ]
