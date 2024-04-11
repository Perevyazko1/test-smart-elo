from rest_framework import serializers

from core.models import OrderProduct, ProductionStep
from core.pages.new_eq.serializers.get_department_info import get_eq_card_department_info
from core.pages.new_eq.serializers.get_eq_card_assignments import get_eq_card_assignments
from core.pages.new_eq.serializers.get_eq_card_count_data import get_eq_card_count_data
from core.pages.new_eq.services.get_eq_req_params import RequestParams
from core.serializers import ProductSerializer, FabricSerializer, OrderSerializer
from staff.models import Department


class EqOrderProductInfoSerializer(serializers.Serializer):
    count_all = serializers.IntegerField()
    count_in_work = serializers.IntegerField()
    count_ready = serializers.IntegerField()
    count_await = serializers.IntegerField()
    tariff = serializers.IntegerField()


class EqDepartmentInfoSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    count_in_work = serializers.IntegerField()
    count_all = serializers.IntegerField()


class EqCardSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    main_fabric = FabricSerializer(read_only=True)
    second_fabric = FabricSerializer(read_only=True)
    third_fabric = FabricSerializer(read_only=True)
    order = OrderSerializer(read_only=True)
    assignments = serializers.SerializerMethodField(read_only=True)
    card_info = serializers.SerializerMethodField()
    department_info = serializers.SerializerMethodField()
    plane_date = serializers.SerializerMethodField()
    further_packaging = serializers.SerializerMethodField()

    class Meta:
        model = OrderProduct
        fields = [
            'id',
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
            'department_info',
            'plane_date',
            'further_packaging',
        ]
        read_only_fields = [
            'series_id',
            'plane_date',
            'further_packaging',
        ]

    def get_assignments(self, obj: OrderProduct):
        eq_params: RequestParams = self.context.get('eq_params')
        target_list = self.context.get('target_list')

        return get_eq_card_assignments(
            target_list=target_list,
            eq_params=eq_params,
            order_product=obj,
        )

    def get_further_packaging(self, obj: OrderProduct):
        eq_params: RequestParams = self.context.get('eq_params')
        production_step = ProductionStep.objects.filter(
            product=obj.product,
            department=eq_params.department
        ).exists()
        if production_step:
            return production_step.next_step.all().filter(
                department__name="Упаковка"
            ).exists()
        else:
            return False

    def get_department_info(self, obj: OrderProduct):
        eq_params: RequestParams = self.context.get('eq_params')
        data = get_eq_card_department_info(
            order_product=obj,
            department=eq_params.department
        )
        serializer = EqDepartmentInfoSerializer(data=data, many=True)
        if serializer.is_valid():
            return serializer.data
        else:
            raise serializers.ValidationError(serializer.errors)

    def get_card_info(self, obj: OrderProduct):
        eq_params: RequestParams = self.context.get('eq_params')
        data = get_eq_card_count_data(
            order_product=obj,
            department=eq_params.department
        )
        serializer = EqOrderProductInfoSerializer(data=data)
        if serializer.is_valid():
            return serializer.data
        else:
            raise serializers.ValidationError(serializer.errors)

    def get_plane_date(self, obj: OrderProduct):
        assignment_data = self.get_assignments(obj)

        min_plane_date = None

        # Пройдитесь по каждому объекту в данных
        for assignment in assignment_data:
            # Получите plane_date из текущего объекта
            plane_date = assignment.get('plane_date')
            # Если plane_date не равна None и это первая не None дата или она меньше текущей минимальной даты
            if plane_date is not None and (min_plane_date is None or plane_date < min_plane_date):
                min_plane_date = plane_date

        # Верните результат
        if min_plane_date is not None:
            # Если найдена ненулевая дата, верните ее
            result = min_plane_date
        else:
            # Если все даты plane_date равны None, верните None
            result = None
        return result
