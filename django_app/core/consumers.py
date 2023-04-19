import json
from dataclasses import dataclass, asdict

from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class MainConsumer(WebsocketConsumer):
    def __init__(self):
        super().__init__()
        self.ws_user = None
        self.user_pin_code = None
        self.group_name = None

    def connect(self):
        self.user_pin_code = self.scope['url_route']['kwargs']['pin_code']
        user_department_number = self.scope['url_route']['kwargs']['department_number']
        self.group_name = str(user_department_number)

        async_to_sync(self.channel_layer.group_add)(
            self.group_name, self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        if self.group_name and self.channel_name:
            async_to_sync(self.channel_layer.group_discard)(
                self.group_name, self.channel_name
            )

    def client_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        self.send(text_data=json.dumps(message, ensure_ascii=False))


@dataclass
class EqNotification:
    initiator: int
    action: str
    data: dict


def ws_group_updates(groups_and_data: dict, pin_code: int):
    channel_layer = get_channel_layer()
    print(groups_and_data)

    for group_name, data in groups_and_data.items():
        result = EqNotification(
            action='update_eq_lists',
            initiator=pin_code,
            data=data
        )
        async_to_sync(channel_layer.group_send)(str(group_name), {"type": "client_message", "message": asdict(result)})
