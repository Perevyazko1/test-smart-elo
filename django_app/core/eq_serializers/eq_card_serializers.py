from rest_framework import serializers

from ..methods.get_week_info import GetWeekInfo
from ..models import *


class EQOrderProductInfoSerializer(serializers.Serializer):
    count_all = serializers.IntegerField()
    count_in_work = serializers.IntegerField()
    count_ready = serializers.IntegerField()
    count_await = serializers.IntegerField()
    tariff = serializers.IntegerField()


class EQDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class EQEmployeeSerializer(serializers.ModelSerializer):
    departments = EQDepartmentSerializer(read_only=True)
    current_department = EQDepartmentSerializer(read_only=True)

    class Meta:
        model = Employee
        fields = [
            'username',
            'first_name',
            'last_name',
            'pin_code',
            'departments',
            'current_department',
        ]
        read_only_fields = [
            'username',
            'pin_code',
        ]


class EQProductPicturesSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductPicture
        fields = ['id', 'image']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None


class EQTechProcessSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = TechnologicalProcess
        fields = ["id", "name", "image"]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None


class EQFabricSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Fabric
        fields = [
            'id',
            'fabric_id',
            'name',
            'image_filename',
            'image',
        ]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None


class EQProductSerializer(serializers.ModelSerializer):
    technological_process = EQTechProcessSerializer()
    product_pictures = EQProductPicturesSerializer(many=True)
    technological_process_confirmed = EQEmployeeSerializer()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'technological_process',
            'product_pictures',
            'technological_process_confirmed',
        ]
        read_only_fields = [
            'id',
            'name',
            'product_pictures',
        ]


class EQOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'project'
        ]


class EQAssignmentsSerializer(serializers.ModelSerializer):
    executor = EQEmployeeSerializer()
    inspector = EQEmployeeSerializer()

    class Meta:
        model = Assignment
        fields = [
            'number',
            'notes',
            'status',
            'department',
            'executor',
            'inspector',
        ]


class EQCardSerializer(serializers.ModelSerializer):
    product = EQProductSerializer(read_only=True)
    main_fabric = EQFabricSerializer(read_only=True)
    second_fabric = EQFabricSerializer(read_only=True)
    third_fabric = EQFabricSerializer(read_only=True)
    order = EQOrderSerializer(read_only=True)
    assignments = serializers.SerializerMethodField(read_only=True)
    card_info = EQOrderProductInfoSerializer(read_only=True)

    class Meta:
        model = OrderProduct
        fields = [
            'series_id',
            'product',
            'main_fabric',
            'second_fabric',
            'third_fabric',
            'order',
            'urgency',
            'comment_base',
            'comment_case',
            'assignments',
            'card_info',
        ]
        read_only_fields = [
            'series_id'
        ]

    def get_assignments(self, obj):
        status_list: list = self.context.get('status_list')
        department_number: list = self.context.get('department_number')

        week = self.context.get('week')
        year = self.context.get('year')

        week_info = GetWeekInfo(week=week, year=year).execute()

        qs = obj.assignments.all()

        if status_list:
            qs = obj.assignments.filter(
                status=status_list[0],
                department__number=department_number,
            )

        if status_list == ['ready']:
            qs = qs.filter(
                date_completion__gt=week_info.date_range[0],
                date_completion__lte=week_info.date_range[1],
            )

        return EQAssignmentsSerializer(qs[:50], many=True).data

    def get_count_data(self, obj: OrderProduct):
        department_number = self.context.get('department_number')
        production_step = ProductionStep.objects.get(
            product=obj.product,
            department__number=department_number
        )

        if production_step.production_step_tariff:
            tariff = production_step.production_step_tariff.tariff
        else:
            tariff = 0
        count_all = obj.quantity,
        queryset = obj.assignments.filter(department__number=department_number)

        return (
            tariff,
            count_all[0],
            queryset.filter(status='in_work').count(),
            queryset.filter(status='ready').count(),
            queryset.filter(status='await').count(),
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        tariff, count_all, count_in_work, count_ready, count_await = self.get_count_data(instance)

        representation['count_all'] = count_all
        representation['count_in_work'] = count_in_work
        representation['count_ready'] = count_ready
        representation['count_await'] = count_await
        representation['tariff'] = tariff

        return representation
