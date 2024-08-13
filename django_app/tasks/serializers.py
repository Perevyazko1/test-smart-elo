from rest_framework import serializers

from staff.models import Employee, Department
from staff.serializers import EmployeeSerializer, DepartmentSerializer

from .models import Task, TaskImage, TaskComment, TaskViewInfo


class TaskImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskImage
        fields = ['id', 'image', 'thumbnail']


class TaskViewInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskViewInfo
        fields = ['id', 'employee', 'task', 'last_date']


class TaskCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskComment
        fields = [
            'id',
            'add_date',
            'author',
            'comment',
            'task',
        ]


class TaskReadSerializer(serializers.ModelSerializer):
    task_images = TaskImageSerializer(many=True, read_only=True)
    appointed_by = EmployeeSerializer()
    created_by = EmployeeSerializer()
    executor = EmployeeSerializer()
    co_executors = EmployeeSerializer(many=True)
    for_departments = DepartmentSerializer(many=True)

    new_comment_count = serializers.SerializerMethodField(read_only=True)
    last_comment = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'status', 'urgency', 'view_mode', 'for_departments',
            'title', 'description', 'execution_comment', 'deadline', 'created_at', 'created_by', 'ready_at',
            'verified_at', 'appointed_at', 'appointed_by', 'executor', 'co_executors',
            'task_images', 'new_comment_count', 'last_comment',
        ]

    def get_new_comment_count(self, obj: Task):
        """Get image url method. """
        last_check = TaskViewInfo.objects.filter(
            employee=self.context.get('user'),
            task=obj,
        )
        if last_check.exists():
            return TaskComment.objects.filter(
                task=obj,
                add_date__gt=last_check[0].last_date
            ).count()
        else:
            return TaskComment.objects.filter(
                task=obj,
            ).count()

    def get_last_comment(self, obj: Task):
        """Get image url method. """
        last_comment = TaskComment.objects.filter(
            task=obj,
        )
        if last_comment.exists():
            return TaskCommentSerializer(last_comment[0]).data
        return None

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
            'title', 'description', 'execution_comment', 'deadline',
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
