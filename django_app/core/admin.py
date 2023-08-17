from django.contrib import admin
from django.utils.safestring import mark_safe

from core.models import Product, ProductPicture, Fabric, Order, OrderProduct, Assignment, ProductionStep, \
    TechnologicalProcess, ProductionStepTariff


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
            return mark_safe(f"<img src='/media/{product_image.image}' style='max-height: 25px;'>")
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
        return mark_safe(f"<img src='/media/{obj.thumbnail}' style='max-height: 50px;'>")

    @staticmethod
    def get_preview(obj: ProductPicture):
        return mark_safe(f"<img src='{obj.image.url}' style='max-height: 300px;'>")


@admin.register(OrderProduct)
class OrderProductAdmin(admin.ModelAdmin):
    list_display = ['series_id', 'product', 'status', 'quantity', 'urgency']
    list_display_links = ['series_id']

    list_per_page = 20

    search_fields = ['product__name', 'series_id']
    list_filter = ['order__project', 'status']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    change_list_template = 'admin/model_change_list.html'

    list_display = ['number', 'moment', 'project', 'planned_date']

    list_filter = ['project']

    search_fields = ['project', 'number']


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['number', 'status', 'department', 'executor', 'inspector', 'order_product']
    list_display_links = ['number', 'status', 'department', 'executor', 'inspector']

    list_filter = ['status', 'department', 'executor']

    list_per_page = 20

    search_fields = ['date_completion', 'number', 'order_product__series_id']


@admin.register(ProductionStep)
class ProductionStepAdmin(admin.ModelAdmin):
    list_display = ['department', 'product', 'production_step_tariff']
    list_display_links = ['department', 'product', 'production_step_tariff']

    list_filter = ['department']

    list_per_page = 20

    search_fields = ['product__name', 'next_step__department__name', 'department__name']


@admin.register(TechnologicalProcess)
class ProductionStepAdmin(admin.ModelAdmin):
    list_display = ['name']
    list_display_links = ['name']

    list_per_page = 20

    search_fields = ['name', 'schema']


admin.site.register(ProductionStepTariff)
admin.site.register(Fabric)
