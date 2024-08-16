"""Serializers for EQ Page. """
from rest_framework import serializers

from core.models import (
    OrderProduct,
    Product,
    ProductPicture,
    Order,
    Fabric, ProductionStep,
)
from src.log_time import log_time
from staff.serializers import EmployeeSerializer

from .service.get_eq_card_assignments import get_eq_card_assignments
from .service.get_eq_card_info import get_eq_card_info
from ...serializers import TechProcessSerializer


class EqFabricSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        """Metadata. """
        model = Fabric
        fields = [
            'id',
            'name',
            'image',
            'thumbnail',
        ]

    def get_image(self, obj):
        """Get image url method. """
        if obj.image:
            return obj.image.url
        return None

    def get_thumbnail(self, obj):
        """Get thumbnail url method. """
        if obj.thumbnail:
            return obj.thumbnail.url
        return None


class EqProductPictureSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        """Metadata. """
        model = ProductPicture
        fields = [
            'id',
            'image',
            'thumbnail',
        ]

    def get_image(self, obj):
        """Get image url method. """
        if obj.image:
            return obj.image.url
        return None

    def get_thumbnail(self, obj):
        """Get thumbnail url method. """
        if obj.thumbnail:
            return obj.thumbnail.url
        return None


class EqOrderSerializer(serializers.ModelSerializer):
    class Meta:
        """Metadata. """
        model = Order
        fields = [
            'id',
            'project',
            'planned_date',
            'comment_base',
            'comment_case',
            'moment',
            'inner_number',
        ]


class EqProductSerializer(serializers.ModelSerializer):
    product_pictures = EqProductPictureSerializer(many=True)
    technological_process = TechProcessSerializer(read_only=True)
    technological_process_confirmed = EmployeeSerializer()

    class Meta:
        """Metadata. """
        model = Product
        fields = [
            'id',
            'name',
            'product_pictures',
            'technological_process',
            'technological_process_confirmed',
        ]


class EqOrderProductSerializer(serializers.ModelSerializer):
    product = EqProductSerializer(read_only=True)
    order = EqOrderSerializer(read_only=True)
    main_fabric = EqFabricSerializer(read_only=True)
    second_fabric = EqFabricSerializer(read_only=True)
    third_fabric = EqFabricSerializer(read_only=True)
    assignments = serializers.SerializerMethodField(read_only=True)
    card_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        """Metadata. """
        model = OrderProduct
        fields = [
            'id',
            'series_id',
            'urgency',
            'product',
            'order',
            'main_fabric',
            'second_fabric',
            'third_fabric',
            'assignments',
            'card_info',
        ]

    def get_assignments(self, obj: OrderProduct):
        """Get related assignments. """
        eq_params = self.context.get('eq_params')
        target_list = self.context.get('target_list')

        return get_eq_card_assignments(
            target_list=target_list,
            eq_params=eq_params,
            order_product=obj,
        )

    def get_card_info(self, obj: OrderProduct):
        eq_params = self.context.get('eq_params')
        return get_eq_card_info(
            order_product=obj,
            department=eq_params['department'],
        )
