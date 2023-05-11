from rest_framework import serializers

from core.models import ProductionStepTariff, ProductionStep
from core.serializers import ProductSerializer
from staff.serializers import DepartmentSerializer, EmployeeSerializer


class ProductionStepTariffSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
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
    product = ProductSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    production_step_tariff = ProductionStepTariffSerializer(read_only=True)

    class Meta:
        model = ProductionStep
        fields = [
            'product',
            'department',
            'production_step_tariff',
        ]
