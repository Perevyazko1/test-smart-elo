import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


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

    def receive(self, text_data, **kwargs):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.group_name, {"type": "chat_message", "message": message}
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        self.send(text_data=json.dumps({"message": message}))
