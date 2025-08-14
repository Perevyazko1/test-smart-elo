from core.models import OrderProduct, Product, Fabric, Order, Tariff, Assignment


def clear_db():
    Assignment.objects.all().delete()
    OrderProduct.objects.all().delete()
    Product.objects.all().delete()
    Fabric.objects.all().delete()
    Order.objects.all().delete()
    Tariff.objects.all().delete()