from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Command(BaseCommand):
    help = "Crée automatiquement un superuser si absent (Render free)"

    def handle(self, *args, **options):
        if os.getenv("CREATE_SUPERUSER") != "1":
            return

        username = os.getenv("DJANGO_SUPERUSER_USERNAME")
        email = os.getenv("DJANGO_SUPERUSER_EMAIL")
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

        if not username or not password:
            self.stdout.write("⚠️ Variables superuser manquantes.")
            return

        user = User.objects.filter(username=username).first()
        if user:
            self.stdout.write("ℹ️ Superuser déjà existant.")
            return

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )

        self.stdout.write(self.style.SUCCESS("✅ Superuser créé avec succès."))
