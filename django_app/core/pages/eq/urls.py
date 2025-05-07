from django.urls import path, include
from rest_framework import routers

from .views import (
    EqCardsViewSet, update_card, get_eq_filters, get_week_data, get_card, update_assignments, update_timing_info,
    get_plan_info, print_labels)

router = routers.DefaultRouter()
router.register(r'get_eq_cards', EqCardsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('update_card/', update_card),
    path('update_assignments_info/', update_assignments),
    path('update_timing_info/', update_timing_info),
    path('get_eq_filters/', get_eq_filters),
    path('get_week_data/', get_week_data),
    path('get_card/', get_card),
    path('get_plan_info/', get_plan_info),
    path('print_labels/', print_labels),
]
