from django.urls import path
from core.views import import_orders


urlpatterns = [
    path('import_orders/', import_orders)
]