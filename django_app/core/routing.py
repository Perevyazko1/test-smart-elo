from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"wss/(?P<pin_code>\w+)/(?P<department_number>\w+)/$", consumers.MainConsumer.as_asgi()),
]
