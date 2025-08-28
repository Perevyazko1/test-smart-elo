from rest_framework import serializers

from staff.serializers import DepartmentSerializer
from .models import *


class ProductionStepCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionStepComment
        fields = [
            "id",
            "production_step",
            "author",
            "add_date",
            "comment",
        ]


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


class FabricPictureSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        """Metadata. """
        model = FabricPicture
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


class FabricSerializer(serializers.ModelSerializer):
    fabric_pictures = FabricPictureSerializer(many=True)

    class Meta:
        model = Fabric
        fields = [
            'id',
            'fabric_id',
            'name',
            'fabric_pictures',
        ]


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
