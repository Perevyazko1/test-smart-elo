from django.urls import path

from .views import (
    get_tariff_rows,
    update_tariff_data,
    set_confirmed_tariff,
    get_projects,
    confirm_op,
)

urlpatterns = [
    path('get_tariff_rows/', get_tariff_rows),
    path('get_projects/', get_projects),
    path('update_tariff_data/', update_tariff_data),
    path('set_confirmed_tariff/', set_confirmed_tariff),
    path('confirm_op/', confirm_op),

]
