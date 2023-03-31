from django.contrib import admin
from django.utils.safestring import mark_safe

from core.models import Product, ProductPicture, Fabric, Order, OrderProduct, Assignment, ProductionStep, \
    TechnologicalProcess


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['product_image', 'name', 'status', 'group']
    list_display_links = ['product_image', 'name']

    list_per_page = 20

    search_fields = ['name']

    list_filter = ['group', 'status']

    @staticmethod
    def product_image(obj: Product):
        product_image = ProductPicture.objects.filter(product=obj).first()
        if product_image:
            return mark_safe(f"<img src='{product_image.image.url}' style='max-height: 25px;'>")
        return 'Без изобр.'


@admin.register(ProductPicture)
class ProductPictureAdmin(admin.ModelAdmin):
    list_display = ['get_product_image', 'image']
    fields = ['product', 'image', 'get_preview']
    readonly_fields = ['get_preview']

    list_per_page = 20

    search_fields = ['product__name']

    @staticmethod
    def get_product_image(obj: ProductPicture):
        return mark_safe(f"<img src='{obj.image.url}' style='max-height: 50px;'>")

    @staticmethod
    def get_preview(obj: ProductPicture):
        return mark_safe(f"<img src='{obj.image.url}' style='max-height: 300px;'>")


@admin.register(OrderProduct)
class OrderProductAdmin(admin.ModelAdmin):
    list_display = ['series_id', 'product', 'status', 'quantity', 'urgency']
    list_display_links = ['series_id']

    list_per_page = 20

    search_fields = ['product']
    list_filter = ['order__project']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    change_list_template = 'admin/model_change_list.html'

    list_display = ['number', 'project', 'planned_date']

    list_filter = ['project']

    search_fields = ['project']


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['number', 'order_product', 'status', 'price', 'department', 'executor', 'inspector']

    list_per_page = 20

    search_fields = ['assigment_id', 'status', 'date_completion']


admin.site.register(ProductionStep)
admin.site.register(Fabric)
admin.site.register(TechnologicalProcess)
