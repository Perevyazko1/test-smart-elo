import json
import logging
from dataclasses import dataclass, asdict
from enum import Enum

from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from staff.models import Department

logger = logging.getLogger(__name__)


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
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ws_user = None
        self.user_pin_code = None
        self.group_name = None

    def connect(self):
        try:
            self.user_pin_code = self.scope['url_route']['kwargs']['pin_code']
            user_department_number = self.scope['url_route']['kwargs']['department_number']
            self.group_name = str(user_department_number)

            async_to_sync(self.channel_layer.group_add)(
                self.group_name, self.channel_name
            )
            self.accept()
        except Exception as e:
            logger.error(f"Error connecting to websocket: {e}", exc_info=True)

    def disconnect(self, close_code):
        # Leave room group
        if self.group_name and self.channel_name:
            try:
                async_to_sync(self.channel_layer.group_discard)(
                    self.group_name, self.channel_name
                )
            except Exception as e:
                logger.error(f"Error disconnecting from websocket: {e}")

    def client_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        try:
            self.send(text_data=json.dumps(message, ensure_ascii=False))
        except Exception as e:
            logger.error(f"Error sending message to websocket: {e}")


def ws_group_updates(pin_code: str, notification_data: dict):
    channel_layer = get_channel_layer()

    for department_number, data in notification_data.items():
        result = EqNotification(
            initiator=pin_code,
            data=data,
        )
        try:
            async_to_sync(channel_layer.group_send)(
                str(department_number),
                {"type": "client_message", "message": asdict(result)}
            )
        except Exception as e:
            logger.error(f"Error sending group update to {department_number}: {e}")


def ws_send_to_all(data):
    channel_layer = get_channel_layer()
    departments = Department.objects.all().exclude(
        number__in=[0, 50]
    )
    for department in departments:
        try:
            async_to_sync(channel_layer.group_send)(
                str(department.number),
                {"type": "client_message", "message": data}
            )
        except Exception as e:
            logger.error(f"Error sending to all (department {department.number}): {e}")


def ws_send_to_department(department_number, data):
    channel_layer = get_channel_layer()
    try:
        async_to_sync(channel_layer.group_send)(
            str(department_number),
            {"type": "client_message", "message": data}
        )
    except Exception as e:
        logger.error(f"Error sending to department {department_number}: {e}")


def ws_update_notification(department_number):
    """Send command to update notification. """
    channel_layer = get_channel_layer()

    message = EqNotification(
        initiator="",
        data={
            "action": EqNotificationActions.UPDATE_NOTIFICATION.value,
        },
    )

    try:
        async_to_sync(channel_layer.group_send)(
            str(department_number),
            {"type": "client_message", "message": asdict(message)}
        )
    except Exception as e:
        logger.error(f"Error sending update notification to {department_number}: {e}")
