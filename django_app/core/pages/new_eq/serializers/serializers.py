from rest_framework import serializers

from core.models import OrderProduct
from core.pages.new_eq.serializers.get_department_info import get_eq_card_department_info
from core.pages.new_eq.serializers.get_eq_card_assignments import get_eq_card_assignments
from core.pages.new_eq.serializers.get_eq_card_count_data import get_eq_card_count_data
from core.pages.new_eq.services.get_eq_req_params import RequestParams
from core.serializers import ProductSerializer, FabricSerializer, OrderSerializer
from staff.serializers import EmployeeSerializer


class EqOrderProductInfoSerializer(serializers.Serializer):
    count_all = serializers.IntegerField()
    count_in_work = serializers.IntegerField()
    count_ready = serializers.IntegerField()
    count_await = serializers.IntegerField()
    tariff = serializers.IntegerField()


class EqDepartmentInfoSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    count_in_work = serializers.IntegerField()


class EqCardSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    main_fabric = FabricSerializer(read_only=True)
    second_fabric = FabricSerializer(read_only=True)
    third_fabric = FabricSerializer(read_only=True)
    order = OrderSerializer(read_only=True)
    assignments = serializers.SerializerMethodField(read_only=True)
    card_info = serializers.SerializerMethodField()
    department_info = serializers.SerializerMethodField()

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
        ]
        read_only_fields = [
            'series_id'
        ]

    def get_assignments(self, obj: OrderProduct):
        eq_params: RequestParams = self.context.get('eq_params')
        target_list = self.context.get('target_list')

        return get_eq_card_assignments(
            target_list=target_list,
            eq_params=eq_params,
            order_product=obj,
        )

    def get_department_info(self, obj: OrderProduct):
        eq_params: RequestParams = self.context.get('eq_params')
        data = get_eq_card_department_info(
            order_product=obj,
            department_number=eq_params.department_number
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
            department_number=eq_params.department_number
        )
        serializer = EqOrderProductInfoSerializer(data=data)
        if serializer.is_valid():
            return serializer.data
        else:
            raise serializers.ValidationError(serializer.errors)
