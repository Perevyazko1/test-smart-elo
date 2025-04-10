from django.urls import path, include

from .views import get_kpi_data


urlpatterns = [
    path('get_kpi_data/', get_kpi_data),
]
