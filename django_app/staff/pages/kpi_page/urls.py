from django.urls import path

from .views import get_kpi_data, get_report

urlpatterns = [
    path('get_kpi_data/', get_kpi_data),
    path('get_report/', get_report),
]
