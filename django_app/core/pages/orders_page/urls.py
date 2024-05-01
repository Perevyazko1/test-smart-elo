"""Orders page urls"""
from django.urls import path, include

from rest_framework import routers

from .views import (OrderPageViewSet,
                    add_comment,
                    edit_comment,
                    )

router = routers.DefaultRouter()
router.register(r'orders', OrderPageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('add_comment/', add_comment),
    path('edit_comment/', edit_comment),
]
