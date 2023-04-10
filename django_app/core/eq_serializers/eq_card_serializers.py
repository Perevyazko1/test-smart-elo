from rest_framework import serializers
from django.db.models import Count, Case, When

from src.query_debugger import query_debugger
from ..models import *
from staff.models import Employee, Department


class EQOrderProductInfoSerializer(serializers.Serializer):
    count_all = serializers.IntegerField()
    count_in_work = serializers.IntegerField()
    count_ready = serializers.IntegerField()
    count_await = serializers.IntegerField()
    tax = serializers.IntegerField()


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
    class Meta:
        model = ProductPicture
        fields = '__all__'


class EQFabricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fabric
        fields = '__all__'


class EQProductSerializer(serializers.ModelSerializer):
    product_pictures = EQProductPicturesSerializer(many=True)
    technological_process_confirmed = EQEmployeeSerializer()

    class Meta:
        model = Product
        fields = [
            'name',
            'product_pictures',
            'technological_process_confirmed',
        ]
        read_only_fields = [
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
        if status_list:
            return EQAssignmentsSerializer(obj.assignments.filter(status=status_list[0]), many=True).data
        return EQAssignmentsSerializer(obj.assignments.all(), many=True).data

    def get_count_data(self, obj: OrderProduct):
        department_number = self.context.get('department_number')
        tax = ProductionStep.objects.get(
            product=obj.product,
            department__number=department_number
        ).tax
        count_all = obj.quantity,
        queryset = obj.assignments.filter(department__number=department_number) \
            .annotate(
            count_in_work=Count(Case(When(status='in_work', then=1))),
            count_ready=Count(Case(When(status='ready', then=1))),
            count_await=Count(Case(When(status='await', then=1))),
        )

        return (
            tax,
            count_all[0],
            queryset.values_list('count_in_work', flat=True).first() or 0,
            queryset.values_list('count_ready', flat=True).first() or 0,
            queryset.values_list('count_await', flat=True).first() or 0,
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        tax, count_all, count_in_work, count_ready, count_await = self.get_count_data(instance)

        representation['count_all'] = count_all
        representation['count_in_work'] = count_in_work
        representation['count_ready'] = count_ready
        representation['count_await'] = count_await
        representation['tax'] = tax

        return representation
