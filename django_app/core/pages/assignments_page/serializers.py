from rest_framework import serializers

from core.models import Assignment
from core.serializers import OrderProductSerializer, ProductionStepTariffSerializer
from staff.serializers import EmployeeSerializer, DepartmentSerializer


class AssignmentExtendedSerializer(serializers.ModelSerializer):
    executor = EmployeeSerializer()
    inspector = EmployeeSerializer()
    department = DepartmentSerializer()
    order_product = OrderProductSerializer()
    tariff = ProductionStepTariffSerializer()

    class Meta:
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
            'tariff',
        ]
