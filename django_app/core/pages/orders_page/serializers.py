"""Orders page serializers. """
from django.db.models import Sum

from rest_framework import serializers

from staff.models import Department
from staff.serializers import EmployeeSerializer
from ...models import (Order,
                       OrderProduct,
                       ProductPicture,
                       ProductionStep,
                       Assignment,
                       OrderProductComment,
                       )


class OrderPageListSerializer(serializers.ModelSerializer):
    class Meta:
        """Meta. """
        model = Order
        fields = [
            'id',
            'number',
            'moment',
            'project',
            'planned_date',
            'urgency',
        ]


class OrderProductCommentSerializer(serializers.ModelSerializer):
    author = EmployeeSerializer(read_only=True)

    class Meta:
        """Metadata. """
        model = OrderProductComment
        fields = [
            'id',
            'author',
            'order_product',
            'important',
            'add_date',
            'deleted',
            'text',
        ]


class OrderProductSerializer(serializers.ModelSerializer):
    class Meta:
        """Meta. """
        model = OrderProduct
        fields = [
            'id',
            'series_id',
            'product_name',
            'product_image_url',
            'quantity',
            'status',
            'urgency',
            'departments_info',
            'op_comments',
        ]

    product_name = serializers.SerializerMethodField(read_only=True)
    product_image_url = serializers.SerializerMethodField(read_only=True)
    departments_info = serializers.SerializerMethodField(read_only=True)
    op_comments = serializers.SerializerMethodField(read_only=True)

    def get_op_comments(self, obj):
        """Get order product comments. """
        qs = OrderProductComment.objects.filter(
            order_product=obj,
        ).order_by('important', 'add_date')
        return OrderProductCommentSerializer(qs, many=True).data

    def get_product_name(self, obj: OrderProduct):
        """Get product name. """
        return obj.product.name

    def get_product_image_url(self, obj: OrderProduct):
        """Get first product image url or None. """
        image = ProductPicture.objects.filter(
            product=obj.product
        )
        if image.exists():
            return image.first().thumbnail.url
        return None

    def get_departments_info(self, obj: OrderProduct):
        """Get departments info. """
        result = {}
        production_steps = ProductionStep.objects.filter(
            product=obj.product
        ).exclude(
            department__name__in=["Старт", "Готово"]
        )
        for production_step in production_steps:
            assignments = Assignment.objects.filter(
                order_product=obj,
                department=production_step.department
            )
            result[production_step.department.name] = {
                "await": assignments.filter(status="await").count(),
                "created": assignments.filter(status="created").count(),
                "in_work": assignments.filter(status="in_work").count(),
                "ready": assignments.filter(status="ready").count(),
            }
        return result


class OrderPageDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        """Meta. """
        model = Order
        fields = [
            'id',
            'number',
            'moment',
            'project',
            'planned_date',
            'urgency',
            'comment_base',
            'comment_case',
            'order_products',
            'order_ready_info',
        ]

    order_products = serializers.SerializerMethodField(read_only=True)
    order_ready_info = serializers.SerializerMethodField(read_only=True)

    def get_order_products(self, obj):
        """Order products. """
        qs = OrderProduct.objects.filter(
            order=obj
        )
        return OrderProductSerializer(qs, many=True).data

    def get_order_ready_info(self, obj):
        """Total assignment info. """
        total_product_count = OrderProduct.objects.filter(
            order=obj,
        ).exclude(
            assignments__department__number=1,
            assignments__inspector__isnull=False
        ).aggregate(total=Sum('quantity'))['total']

        total_departments = Department.objects.all().exclude(single=True).exclude(number__in=[0, 50]).count()

        assignments_qs = Assignment.objects.filter(
            order_product__order=obj
        ).exclude(department__single=True)

        return {
            "in_work": assignments_qs.filter(status="in_work").count(),
            "all": assignments_qs.count() + (total_product_count * total_departments),
            "ready": assignments_qs.filter(inspector__isnull=False).count(),
        }

