"""Serializers for tariffication page. """
from rest_framework import serializers

from staff.serializers import DepartmentSerializer, EmployeeSerializer
from core.models import (
    ProductionStep,
    Assignment,
    ProductPicture,
    Tariff,
    OrderProduct,
)


class TariffSerializer(serializers.ModelSerializer):
    created_by = EmployeeSerializer(read_only=True)

    class Meta:
        """Metadata. """
        model = Tariff
        fields = [
            'id',
            'amount',
            'add_date',
            'created_by',
            'comment',
        ]


class PageListSerializer(serializers.ModelSerializer):
    """Serializer for tariffication list page. """
    department = DepartmentSerializer(read_only=True)
    confirmed_tariff = TariffSerializer(read_only=True)
    proposed_tariff = TariffSerializer(read_only=True)

    has_assignments = serializers.SerializerMethodField(read_only=True)
    product_name = serializers.SerializerMethodField(read_only=True)
    product_id = serializers.SerializerMethodField(read_only=True)
    product_images = serializers.SerializerMethodField(read_only=True)

    last_order_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        """Metadata. """
        model = ProductionStep
        fields = [
            'id',
            'department',
            'has_assignments',
            'product_name',
            'product_id',
            'product_images',

            'confirmed_tariff',
            'proposed_tariff',
            'last_order_id',
        ]

    def get_last_order_id(self, obj: ProductionStep) -> int:
        """Get first order id for specification detail. """
        target_order_product: OrderProduct = OrderProduct.objects.filter(
            product=obj.product
        ).first()

        return target_order_product.order.id

    def get_has_assignments(self, obj: ProductionStep) -> bool:
        """Get has assignments without tariffication flag. """
        return Assignment.objects.filter(
            order_product__product=obj.product,
            department=obj.department,
            new_tariff__isnull=True,
            inspector__isnull=False,
        ).exists()

    def get_product_name(self, obj: ProductionStep) -> str:
        """Get product name for card. """
        return obj.product.name

    def get_product_id(self, obj: ProductionStep) -> int:
        """Get product name for card. """
        return obj.product.id

    def get_product_images(self, obj: ProductionStep) -> dict:
        """Get product name for card. """
        data = {
            'images': [],
            'thumbnail': [],
        }
        images = ProductPicture.objects.filter(
            product=obj.product,
        )
        for image in images:
            data['images'].append(image.image.url)
            data['thumbnail'].append(image.thumbnail.url)
        return data


class AssignmentTariffSerializer(serializers.ModelSerializer):
    """Post tariffication assignments serializer. """
    department = DepartmentSerializer(read_only=True)
    executor = EmployeeSerializer(read_only=True)
    inspector = EmployeeSerializer(read_only=True)
    project = serializers.SerializerMethodField(read_only=True)
    order_number = serializers.SerializerMethodField(read_only=True)

    class Meta:
        """Metadata. """
        model = Assignment
        fields = [
            'id',
            'number',
            'department',
            'date_completion',
            'appointment_date',
            'inspect_date',
            'status',
            'project',
            'order_number',
            'executor',
            'inspector',
        ]

    def get_project(self, obj: Assignment):
        """Get project name. """
        return obj.order_product.order.project

    def get_order_number(self, obj: Assignment):
        """Get project name. """
        return obj.order_product.order.number


class PostTarifficationSerializer(serializers.ModelSerializer):
    """Post tariffication serializer. """
    department = DepartmentSerializer(read_only=True)
    product_name = serializers.SerializerMethodField(read_only=True)
    product_thumbnails = serializers.SerializerMethodField(read_only=True)
    assignments = serializers.SerializerMethodField(read_only=True)
    proposed_tariff = TariffSerializer(read_only=True)

    class Meta:
        """Metadata. """
        model = ProductionStep
        fields = [
            'id',
            'department',
            'product_name',
            'product_thumbnails',
            'assignments',
            'proposed_tariff',
        ]

    def get_product_name(self, obj: ProductionStep) -> str:
        """Get product name for card. """
        return obj.product.name

    def get_product_thumbnails(self, obj: ProductionStep) -> list:
        """Get product name for card. """
        result = []
        images = ProductPicture.objects.filter(
            product=obj.product,
        )
        for image in images:
            result.append(image.thumbnail.url)

        return result

    def get_assignments(self, obj: ProductionStep):
        """Get product name for card. """
        assignments_qs = Assignment.objects.filter(
            order_product__product=obj.product,
            department=obj.department,
            new_tariff__isnull=True,
            executor__isnull=False,
        )
        return AssignmentTariffSerializer(assignments_qs, many=True).data
