from rest_framework import serializers

from core.models import ProductionStep, ProductionStepTariff, Assignment
from core.serializers import ProductSerializer
from staff.serializers import DepartmentSerializer, EmployeeSerializer


class TariffSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(write_only=True)

    department_id = serializers.IntegerField(write_only=True)

    approved_by = EmployeeSerializer(read_only=True)
    approved_by_id = serializers.IntegerField(write_only=True, required=False)

    proposed_by = EmployeeSerializer(read_only=True)
    proposed_by_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = ProductionStepTariff
        fields = [
            'id',
            'tariff',
            'proposed_tariff',
            'proposed_date',
            'confirmation_date',

            'approved_by',
            'approved_by_id',

            'proposed_by',
            'proposed_by_id',

            'department_id',

            'product_id',
        ]


class TariffPageSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    production_step_tariff = TariffSerializer(read_only=True)
    production_step_tariff_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ProductionStep
        fields = [
            'id',
            'product',
            'department',
            'production_step_tariff',
            'production_step_tariff_id',
        ]


class RetarifficationSerializer(serializers.ModelSerializer):
    executor = EmployeeSerializer(read_only=True)
    string_representation = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            'id',
            'executor',
            'string_representation',
            'inspect_date',
            'date_completion',
        ]

    def get_string_representation(self, obj):
        return str(obj)
