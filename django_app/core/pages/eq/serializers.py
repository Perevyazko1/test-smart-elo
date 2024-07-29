"""Serializers for EQ Page. """
from rest_framework import serializers

from core.models import (
    OrderProduct,
    Product,
    ProductPicture,
    Order,
    Fabric, ProductionStep,
)
from staff.serializers import EmployeeSerializer

from .service.get_eq_card_assignments import get_eq_card_assignments
from .service.get_eq_card_count_data import get_eq_card_count_data
from .service.get_eq_card_department_info import get_eq_card_department_info
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
    further_packaging = serializers.SerializerMethodField(read_only=True)
    department_info = serializers.SerializerMethodField(read_only=True)
    plane_date = serializers.SerializerMethodField(read_only=True)
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
            'further_packaging',
            'department_info',
            'plane_date',
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

    def get_further_packaging(self, obj: OrderProduct):
        eq_params = self.context.get('eq_params')
        production_step = ProductionStep.objects.filter(
            product=obj.product,
            department=eq_params['department']
        )
        if production_step.exists():
            return production_step.first().next_step.all().filter(
                department__name="Упаковка"
            ).exists()
        else:
            return False

    def get_department_info(self, obj: OrderProduct):
        eq_params = self.context.get('eq_params')
        return get_eq_card_department_info(
            order_product=obj,
            department=eq_params['department']
        )

    def get_plane_date(self, obj: OrderProduct):
        """Get planned date. """
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

    def get_card_info(self, obj: OrderProduct):
        eq_params = self.context.get('eq_params')
        return get_eq_card_count_data(
            order_product=obj,
            department=eq_params['department'],
        )
