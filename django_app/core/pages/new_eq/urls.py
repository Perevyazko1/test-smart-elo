from django.urls import path, include
from rest_framework import routers

from .views import GetEqCards

router = routers.DefaultRouter()
router.register(r'get_eq_cards', GetEqCards)


urlpatterns = [
    path('', include(router.urls)),
]
