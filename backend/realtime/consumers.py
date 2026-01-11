# ========================= realtime/consumers.py =========================
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class EchoConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send_json({"type": "welcome", "message": "Connected to EchoConsumer"})


async def receive_json(self, content, **kwargs):
    await self.send_json({"echo": content})


async def disconnect(self, code):
    pass