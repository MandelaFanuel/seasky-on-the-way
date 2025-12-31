# ========================= seasky/asgi.py =========================
import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path

from realtime.consumers import EchoConsumer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "seasky.settings")

django_asgi_app = get_asgi_application()

websocket_urlpatterns = [
    path("ws/echo/", EchoConsumer.as_asgi()),
]

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": URLRouter(websocket_urlpatterns),
    }
)
