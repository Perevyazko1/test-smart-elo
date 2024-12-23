"""Project urls. """
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from rest_framework.decorators import api_view

from django_app.init_data.init_data import init_data


@api_view(['GET'])
def init_app_data(request):
    """Init app data func. """
    result = init_data()

    return JsonResponse({"result": result})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/core/', include('core.urls')),
    path('api/v1/staff/', include('staff.urls')),
    path('api/v1/tasks/', include('tasks.urls')),

    path('init/', init_app_data),
]

urlpatterns += static(
    settings.STATIC_URL,
    document_root=settings.STATIC_ROOT,
)

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
