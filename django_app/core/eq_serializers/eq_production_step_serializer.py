from rest_framework import serializers

from staff.serializers import DepartmentSerializer, EmployeeSerializer
from .eq_card_serializers import EQProductSerializer
from ..models import ProductionStep


class ProductionStepSerializer(serializers.ModelSerializer):
    product = EQProductSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    approved_by = EmployeeSerializer(read_only=True)

    class Meta:
        model = ProductionStep
        fields = [
            'product',
            'department',
            'tax',
            'confirmation_date',
            'approved_by',
        ]
