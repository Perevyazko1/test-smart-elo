from rest_framework import serializers

from staff.models import Employee, Department
from staff.serializers import EmployeeSerializer, DepartmentSerializer

from .models import Task, TaskImage


class TaskImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskImage
        fields = ['id', 'image', 'thumbnail']


class TaskReadSerializer(serializers.ModelSerializer):
    task_images = TaskImageSerializer(many=True, read_only=True)
    appointed_by = EmployeeSerializer()
    created_by = EmployeeSerializer()
    executor = EmployeeSerializer()
    co_executors = EmployeeSerializer(many=True)
    for_departments = DepartmentSerializer(many=True)

    class Meta:
        model = Task
        fields = [
            'id', 'status', 'urgency', 'view_mode', 'for_departments',
            'title', 'description', 'deadline', 'created_at', 'created_by', 'ready_at',
            'verified_at', 'appointed_at', 'appointed_by', 'executor', 'co_executors',
            'task_images',
        ]


class TaskWriteSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    title = serializers.CharField(required=False)
    created_by = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), required=False)
    appointed_by = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), required=False, allow_null=True)
    executor = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), allow_null=True, required=False)
    co_executors = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), many=True, required=False)
    for_departments = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), many=True, required=False)

    class Meta:
        model = Task
        fields = [
            'id', 'status', 'urgency', 'view_mode', 'for_departments',
            'title', 'description', 'deadline',
            'appointed_by', 'executor', 'co_executors',
            'images', 'appointed_at', 'ready_at', 'verified_at', 'created_by',
        ]

    def create(self, validated_data):
        images = validated_data.pop('images', [])
        task = super().create(validated_data)
        for image in images:
            TaskImage.objects.create(task=task, image=image)
        return task

    def update(self, instance, validated_data):
        images = validated_data.pop('images', [])
        instance = super().update(instance, validated_data)
        if images:
            for image in images:
                TaskImage.objects.create(task=instance, image=image)
        return instance
