from django.urls import path
from .views import get_purchaseorders, get_assortment, get_supply, create_loss, test, create_supply


urlpatterns = [
    path('get_purchaseorders/', get_purchaseorders),
    path('get_assortment/', get_assortment),
    path('get_supply/', get_supply),
    path('create_supply/', create_supply),
    path('create_loss/', create_loss),
    path('test/', test),
]
