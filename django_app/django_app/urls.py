"""Project urls. """
from django.conf import settings
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include, re_path
from django.views.static import serve

from django_app.init_data.init_data import init_data


def init_app_data():
    """Init app data func. """
    init_data()

    return JsonResponse({"result": 'inited'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/core/', include('core.urls')),
    path('api/v1/staff/', include('staff.urls')),

    path('init/', init_app_data),

    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]
