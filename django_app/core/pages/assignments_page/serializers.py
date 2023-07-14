from rest_framework import serializers

from core.models import Assignment
from staff.serializers import EmployeeSerializer, DepartmentSerializer


class AssignmentExtendedSerializer(serializers.ModelSerializer):
    executor = EmployeeSerializer()
    inspector = EmployeeSerializer()
    department = DepartmentSerializer()

    class Meta:
        model = Assignment
        fields = [
            'id',
            'number',
            'notes',
            'status',
            'department',
            'executor',
            'inspector',
        ]
