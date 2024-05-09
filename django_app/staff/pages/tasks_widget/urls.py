"""URLs for tasks widget. """
from django.urls import path

from .views import (
    check_tasks_exists,
    get_tasks_count,
)

urlpatterns = [
    path('get_tasks_count/', get_tasks_count),
    path('check_tasks_exists/', check_tasks_exists)
]
