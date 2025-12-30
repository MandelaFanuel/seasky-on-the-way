#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo "🚀 SeaSky Platform - Initialisation du Backend"
echo "================================================"

: "${DJANGO_DEBUG:=false}"
: "${PORT:=8000}"

: "${POSTGRES_HOST:=db}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_DB:=seasky}"
: "${POSTGRES_USER:=fanuel045}"
: "${POSTGRES_PASSWORD:=414141}"

DATABASE_URL="${DATABASE_URL:-}"
DATABASE_URL="$(echo "${DATABASE_URL}" | xargs || true)"

echo "🔍 Variables:"
echo "  • DJANGO_DEBUG=$DJANGO_DEBUG"
echo "  • PORT=$PORT"
echo "  • RENDER_SERVICE_ID=${RENDER_SERVICE_ID:-<empty>}"

if [[ -n "${DATABASE_URL}" ]]; then
  echo "  • DATABASE_URL=***set***"
else
  echo "  • DATABASE_URL=<empty> (fallback POSTGRES_*)"
  echo "  • POSTGRES_HOST=$POSTGRES_HOST"
  echo "  • POSTGRES_PORT=$POSTGRES_PORT"
  echo "  • POSTGRES_DB=$POSTGRES_DB"
  echo "  • POSTGRES_USER=$POSTGRES_USER"
fi
echo ""

if [[ -n "${DATABASE_URL}" ]]; then
  DB_URL="${DATABASE_URL}"
else
  DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
fi
export DB_URL

# Affiche un résumé sans password
python - <<'PY'
import os
u = os.environ.get("DB_URL","").strip()
safe = u
if "@" in u and "://" in u:
    proto, rest = u.split("://",1)
    if "@" in rest and ":" in rest.split("@",1)[0]:
        userpass, hostpart = rest.split("@",1)
        user = userpass.split(":",1)[0]
        safe = f"{proto}://{user}:***@{hostpart}"
print("🧩 DB_URL =", safe if safe else "<empty>")
PY

echo "⏳ Attente de PostgreSQL (test réel via psycopg)..."

python - <<'PY'
import os, sys, time
import psycopg

db_url = (os.environ.get("DB_URL") or "").strip()
if not db_url:
    print("❌ DB_URL vide. Configure DATABASE_URL (Render) ou POSTGRES_* (local).")
    sys.exit(1)

for i in range(1, 61):
    try:
        with psycopg.connect(db_url, connect_timeout=3) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
        print(f"✅ PostgreSQL prêt (connexion OK) (try {i}/60)")
        sys.exit(0)
    except Exception:
        print(f"⌛ ({i}/60) DB pas prête...")
        time.sleep(2)

print("❌ Impossible de se connecter à PostgreSQL.")
print("   👉 Sur Render: vérifie DATABASE_URL (Internal DB URL) + DB 'Available'.")
sys.exit(1)
PY

echo ""
echo "🔄 Migrations..."
python manage.py migrate --noinput

echo ""
echo "📁 Collectstatic..."
python manage.py collectstatic --noinput --clear || true

echo ""
echo "================================================"
echo "🌐 Démarrage du serveur SeaSky"
echo "================================================"

DJ_DEBUG_LOWER="$(echo "${DJANGO_DEBUG}" | tr '[:upper:]' '[:lower:]')"

if [[ "${DJ_DEBUG_LOWER}" == "true" || "${DJANGO_DEBUG}" == "1" ]]; then
  exec python manage.py runserver 0.0.0.0:${PORT}
else
  if command -v gunicorn >/dev/null 2>&1; then
    exec gunicorn seasky.wsgi:application \
      --bind 0.0.0.0:${PORT} \
      --workers "${WEB_CONCURRENCY:-1}" \
      --threads 2 \
      --timeout 120
  else
    exec python manage.py runserver 0.0.0.0:${PORT}
  fi
fi
