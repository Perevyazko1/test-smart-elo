from rest_framework import serializers

from staff.serializers import DepartmentSerializer, EmployeeSerializer
from .eq_card_serializers import EQProductSerializer
from ..models import ProductionStep, ProductionStepTariff


class ProductionStepTariffSerializer(serializers.ModelSerializer):
    product = EQProductSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    approved_by = EmployeeSerializer(read_only=True)

    class Meta:
        model = ProductionStepTariff
        fields = [
            'product',
            'department',
            'tariff',
            'confirmation_date',
            'approved_by',
        ]


class ProductionStepSerializer(serializers.ModelSerializer):
    product = EQProductSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    production_step_tariff = ProductionStepTariffSerializer(read_only=True)

    class Meta:
        model = ProductionStep
        fields = [
            'product',
            'department',
            'production_step_tariff',
        ]
