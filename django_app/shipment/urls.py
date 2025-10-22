from django.urls import path, include
from rest_framework import routers

from .views import *

router = routers.DefaultRouter()
router.register(r'items', ShipmentViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('create_shipment/', create_shipment),
]
