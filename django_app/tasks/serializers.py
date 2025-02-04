from rest_framework import serializers

from .lib.set_executors import set_executors
from .lib.task_confirmation_instructions import task_confirmation_instructions

from .models import Task, TaskImage, TaskComment, TaskViewInfo, TaskExecutor, TaskTariff


def set_tariffs(proposed_tariff_data: dict | None, confirmed_tariff_data: dict | None, task: Task):
    if proposed_tariff_data:
        proposed_tariff_serializer = TaskTariffSerializer(data=proposed_tariff_data)
        if proposed_tariff_serializer.is_valid(raise_exception=True):
            proposed_tariff = proposed_tariff_serializer.save(task=task)
            task.proposed_tariff = proposed_tariff
            task.save()

    if confirmed_tariff_data:
        confirmed_tariff_serializer = TaskTariffSerializer(data=confirmed_tariff_data)
        if confirmed_tariff_serializer.is_valid(raise_exception=True):
            confirmed_tariff = confirmed_tariff_serializer.save(task=task)
            task.confirmed_tariff = confirmed_tariff
            task.save()


class TaskImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskImage
        fields = ['id', 'image', 'thumbnail', 'task']
        read_only_fields = ['thumbnail', 'id']
        extra_kwargs = {'image': {'required': 'True'}}


class TaskViewInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskViewInfo
        fields = ['id', 'employee', 'task', 'last_date']


class TaskCommentSerializer(serializers.ModelSerializer):
    viewers = serializers.SerializerMethodField(read_only=True, required=False)

    class Meta:
        model = TaskComment
        fields = [
            'id',
            'add_date',
            'author',
            'comment',
            'task',


            'viewers',
        ]

    def get_viewers(self, obj: TaskComment):
        qs = TaskViewInfo.objects.filter(
            task=obj.task,
            last_date__gte=obj.add_date,
        )
        return TaskViewInfoSerializer(qs, many=True).data


class TaskTariffSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskTariff
        fields = [
            'id',
            'created_by',
            'amount',
            'comment',
        ]


class TaskExecutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskExecutor
        fields = [
            'id',
            'employee',
            'amount',
        ]


class TaskSerializer(serializers.ModelSerializer):
    task_images = TaskImageSerializer(many=True, required=False, read_only=True)
    task_view_info = TaskViewInfoSerializer(many=True, required=False, read_only=True)
    title = serializers.CharField(required=False)

    new_executor = TaskExecutorSerializer(required=False, allow_null=True)
    new_co_executors = TaskExecutorSerializer(many=True, required=False)
    proposed_tariff = TaskTariffSerializer(required=False)
    confirmed_tariff = TaskTariffSerializer(required=False)

    new_comment_count = serializers.SerializerMethodField(read_only=True)
    last_comment = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'status',
            'urgency',
            'view_mode',
            'for_departments',
            'title',
            'description',
            'deadline',
            'appointed_by',
            'appointed_at',
            'created_at',
            'ready_at',
            'verified_at',
            'created_by',
            'new_executor',
            'new_co_executors',
            'proposed_tariff',
            'confirmed_tariff',
            'task_images',
            'appointed_by_boss',
            'task_view_info',

            'new_comment_count',
            'last_comment',
        ]

    def create(self, validated_data):
        executors_params = {}

        proposed_tariff_data = validated_data.pop('proposed_tariff', None)
        confirmed_tariff_data = validated_data.pop('confirmed_tariff', None)

        if "new_executor" in validated_data:
            new_executor_data = validated_data.pop('new_executor', None)
            executors_params['executor_data'] = new_executor_data
            if new_executor_data is None:
                executors_params['clear_executor'] = True

        if "new_co_executors" in validated_data:
            new_co_executors_data = validated_data.pop('new_co_executors', [])
            executors_params['co_executors_data'] = new_co_executors_data
            if not new_co_executors_data:
                executors_params['clear_co_executors'] = True

        task = super().create(validated_data)

        if proposed_tariff_data or confirmed_tariff_data:
            set_tariffs(
                self.initial_data.get('proposed_tariff', None),
                self.initial_data.get('confirmed_tariff', None),
                task
            )

        executors_params['task'] = task
        if 'executor_data' in executors_params.keys() or 'co_executors_data' in executors_params.keys():
            set_executors(**executors_params)

        return task

    def update(self, instance, validated_data):
        executors_params = {}
        if "new_executor" in validated_data:
            new_executor_data = validated_data.pop('new_executor', None)
            executors_params['executor_data'] = new_executor_data
            if new_executor_data is None:
                executors_params['clear_executor'] = True

        if "new_co_executors" in validated_data:
            new_co_executors_data = validated_data.pop('new_co_executors', [])
            executors_params['co_executors_data'] = new_co_executors_data
            if not new_co_executors_data:
                executors_params['clear_co_executors'] = True

        proposed_tariff_data = validated_data.pop('proposed_tariff', None)
        confirmed_tariff_data = validated_data.pop('confirmed_tariff', None)
        verified_at = validated_data.pop('verified_at', None)

        task = super().update(instance, validated_data)

        if proposed_tariff_data or confirmed_tariff_data:
            set_tariffs(
                self.initial_data.get('proposed_tariff', None),
                self.initial_data.get('confirmed_tariff', None),
                task
            )

        executors_params['task'] = task

        set_executors(**executors_params)

        if verified_at:
            task_confirmation_instructions(task, verified_at)

        task.refresh_from_db()

        return task

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
            ).exclude(
                author=self.context.get('user'),
            ).count()
        else:
            task_comments = TaskComment.objects.filter(
                task=obj,
            ).exclude(
                author=self.context.get('user'),
            )
            if task_comments.exists():
                return task_comments.count()
            elif self.context.get('user') == obj.created_by:
                return 0
            else:
                return 1

    def get_last_comment(self, obj: Task):
        """Get image url method. """
        last_comment = TaskComment.objects.filter(
            task=obj,
        )
        if last_comment.exists():
            return TaskCommentSerializer(last_comment[0]).data
        return None
