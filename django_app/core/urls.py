from django.urls import path, include
from rest_framework import routers

from .views import *


router = routers.DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'product_pictures', ProductPictureViewSet)
router.register(r'fabrics', FabricViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order_products', OrderProductViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'production_steps', ProductionStepViewSet)
router.register(r'technological_processes', TechnologicalProcessViewSet)

router.register(r'eq_cards', EQCardViewSet)


urlpatterns = [
    path('import_orders/', import_orders),
    path('', include(router.urls)),
]
