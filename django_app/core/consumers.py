import json
from dataclasses import dataclass, asdict
from enum import Enum

from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from staff.models import Department


class EqNotificationActions(Enum):
    UPDATE_TARGET_LIST = 'update_eq_lists'
    UPDATE_TARGET_ITEM = 'update_target_item'
    UPDATE_NOTIFICATION = 'update_notification'
    UPDATE_TARGET_TASK = 'update_target_task'


@dataclass
class EqNotification:
    initiator: str
    data: dict


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


def ws_group_updates(pin_code: str, notification_data: dict):
    channel_layer = get_channel_layer()

    for department_number, data in notification_data.items():
        result = EqNotification(
            initiator=pin_code,
            data=data,
        )
        async_to_sync(channel_layer.group_send)(
            str(department_number),
            {"type": "client_message", "message": asdict(result)}
        )


def ws_send_to_all(data):
    channel_layer = get_channel_layer()
    departments = Department.objects.all().exclude(
        number__in=[0, 50]
    )
    for department in departments:
        async_to_sync(channel_layer.group_send)(
            str(department.number),
            {"type": "client_message", "message": data}
        )


def ws_send_to_department(department_number, data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        str(department_number),
        {"type": "client_message", "message": data}
    )

def ws_update_notification(department_number):
    """Send command to update notification. """
    channel_layer = get_channel_layer()

    message = EqNotification(
        initiator="",
        data={
            "action": EqNotificationActions.UPDATE_NOTIFICATION.value,
        },
    )

    async_to_sync(channel_layer.group_send)(
        str(department_number),
        {"type": "client_message", "message": asdict(message)}
    )
