from rest_framework import serializers

from staff.serializers import DepartmentSerializer, EmployeeSerializer
from .models import *


class TechProcessSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = TechnologicalProcess
        fields = ["id", "name", "image"]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None


class ProductPicturesSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductPicture
        fields = ['id', 'image']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None


class FabricSerializer(serializers.ModelSerializer):
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


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'project'
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


class ProductionStepTariffSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    approved_by = EmployeeSerializer(read_only=True)

    class Meta:
        model = ProductionStepTariff
        fields = [
            'product',
            'department',
            'tariff',
            'confirmation_date',
            'approved_by',
        ]


class ProductionStepSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    production_step_tariff = ProductionStepTariffSerializer(read_only=True)

    class Meta:
        model = ProductionStep
        fields = [
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
            'number',
            'notes',
            'status',
            'department',
            'executor',
            'inspector',
        ]
