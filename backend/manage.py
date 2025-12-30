#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
from __future__ import annotations

import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv


def load_env_files() -> None:
    """
    Charge les variables d'environnement de façon robuste.
    Priorité:
      1) backend/.env (même dossier que manage.py)
      2) /app/.env (Docker habituel)
      3) racine projet ../.env (si manage.py est dans backend/)
    """
    base_dir = Path(__file__).resolve().parent

    candidates = [
        base_dir / ".env",               # backend/.env
        Path("/app/.env"),               # Docker
        base_dir.parent / ".env",        # root/.env (optionnel)
    ]

    loaded_any = False
    for env_path in candidates:
        if env_path.exists():
            load_dotenv(env_path, override=True)
            print(f"✅ Environment loaded from: {env_path}")
            loaded_any = True
            break

    if not loaded_any:
        print("⚠️  No .env file found (backend/.env, /app/.env, ../.env). Running with OS env only.")


def ensure_required_env() -> None:
    """
    Vérifie les variables minimales requises.
    (Évite de bloquer inutilement si tu préfères)
    """
    required_vars = ["DJANGO_SECRET_KEY"]
    missing = [v for v in required_vars if not os.getenv(v)]
    if missing:
        print(f"\n❌ Missing required environment variables: {missing}")
        print("Please set them in your .env file (DJANGO_SECRET_KEY=...)")
        sys.exit(1)


def wait_for_db_if_needed(argv: list[str]) -> None:
    """
    Attendre DB seulement pour les commandes qui en ont vraiment besoin.
    shell/createsuperuser aussi, car tu les utilises souvent en Docker.
    """
    if len(argv) < 2:
        return

    cmd = argv[1]

    # Commandes qui touchent à la DB (pratique en Docker)
    db_commands = {
        "migrate", "makemigrations", "flush", "loaddata", "dumpdata",
        "shell", "createsuperuser",
        "dbshell", "showmigrations", "check",
    }

    if cmd not in db_commands:
        return

    # Import Django *après* settings module set
    from django.db import connections
    from django.db.utils import OperationalError

    max_retries = int(os.getenv("DB_WAIT_RETRIES", "30"))
    delay = float(os.getenv("DB_WAIT_DELAY", "1.0"))

    print("🔍 Checking database connection...")
    for i in range(1, max_retries + 1):
        try:
            connections["default"].cursor().execute("SELECT 1;")
            print("✅ Database connection successful")
            return
        except OperationalError:
            print(f"⏳ Waiting for database... ({i}/{max_retries})")
            time.sleep(delay)

    print(f"❌ Could not connect to database after {max_retries * delay:.0f}s")
    sys.exit(1)


def main() -> None:
    """Run administrative tasks."""
    load_env_files()
    ensure_required_env()

    # Settings
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "seasky.settings")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Is it installed and available on your PYTHONPATH?"
        ) from exc

    # Attendre DB si nécessaire (après settings module)
    wait_for_db_if_needed(sys.argv)

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
