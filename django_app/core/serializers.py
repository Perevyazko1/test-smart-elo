from rest_framework import serializers

from staff.serializers import DepartmentSerializer, EmployeeSerializer
from .models import *


class TechProcessSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = TechnologicalProcess
        fields = ["id", "name", "image", "schema"]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None


class ProductPicturesSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = ProductPicture
        fields = ['id', 'image', 'thumbnail']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

    def get_thumbnail(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.url
        return None


class FabricSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Fabric
        fields = [
            'id',
            'fabric_id',
            'name',
            'image_filename',
            'image',
            'thumbnail',
        ]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

    def get_thumbnail(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.url
        return None


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'id',
            'project',
            'moment',
            'number',
            'planned_date',
        ]


class ProductSerializer(serializers.ModelSerializer):
    technological_process = TechProcessSerializer()
    product_pictures = ProductPicturesSerializer(many=True)
    technological_process_confirmed = EmployeeSerializer()

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


class ProductionStepSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = ProductionStep
        fields = [
            'id',
            'product',
            'department',
            'production_step_tariff',
        ]


class AssignmentsSerializer(serializers.ModelSerializer):
    executor = EmployeeSerializer()
    inspector = EmployeeSerializer()

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


class OrderProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    main_fabric = FabricSerializer()
    second_fabric = FabricSerializer()
    third_fabric = FabricSerializer()
    order = OrderSerializer()

    class Meta:
        model = OrderProduct
        fields = [
            'id',
            'series_id',
            'status',
            'product',
            'order',
            'main_fabric',
            'second_fabric',
            'third_fabric',
            'quantity',
            'price',
            'urgency',
        ]
