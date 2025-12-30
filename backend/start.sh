#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo "🚀 SeaSky Platform - Initialisation du Backend"
echo "================================================"

# -----------------------------------------------------------------------------
# Defaults (LOCAL/DOCKER) — Render doit plutôt fournir DATABASE_URL
# -----------------------------------------------------------------------------
: "${POSTGRES_HOST:=db}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_DB:=seasky}"
: "${POSTGRES_USER:=fanuel045}"
: "${POSTGRES_PASSWORD:=414141}"

: "${DJANGO_DEBUG:=false}"
: "${ENVIRONMENT:=development}"
: "${PORT:=8000}"

DATABASE_URL="${DATABASE_URL:-}"
DATABASE_URL="$(echo "${DATABASE_URL}" | xargs || true)" # trim

echo "🔍 Variables:"
echo "  • DJANGO_DEBUG=$DJANGO_DEBUG"
echo "  • ENVIRONMENT=$ENVIRONMENT"
echo "  • PORT=$PORT"
if [[ -n "${DATABASE_URL}" ]]; then
  echo "  • DATABASE_URL=***set***"
else
  echo "  • DATABASE_URL=<empty>"
fi
echo "  • POSTGRES_HOST=$POSTGRES_HOST"
echo "  • POSTGRES_PORT=$POSTGRES_PORT"
echo "  • POSTGRES_DB=$POSTGRES_DB"
echo "  • POSTGRES_USER=$POSTGRES_USER"
echo ""

# -----------------------------------------------------------------------------
# DB URL selection
#   - Render: DATABASE_URL (postgresql://user:pass@host/db)
#   - Local/Docker: build from POSTGRES_*
# -----------------------------------------------------------------------------
if [[ -n "${DATABASE_URL}" ]]; then
  DB_URL="${DATABASE_URL}"
else
  DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
fi

echo "⏳ Attente de PostgreSQL (test réel)..."

python - <<PY
import os, sys, time
import psycopg

db_url = os.environ.get("DB_URL") or ""
db_url = db_url.strip()

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
print("   Vérifie DATABASE_URL (Render) ou POSTGRES_* (local).")
sys.exit(1)
PY
export DB_URL="$DB_URL"

echo ""
echo "🔄 Migrations..."
python manage.py migrate --noinput

echo ""
echo "📁 Collectstatic..."
python manage.py collectstatic --noinput --clear || true

echo ""
echo "👑 Superuser (optionnel)..."
python manage.py create_superuser_if_not_exists || true

echo ""
echo "================================================"
echo "🌐 Démarrage du serveur SeaSky"
echo "================================================"
echo "  • Backend API:  http://0.0.0.0:${PORT}/api/v1/"
echo "  • Admin Django: http://0.0.0.0:${PORT}/admin/"
echo "================================================"

# -----------------------------------------------------------------------------
# Serve
# - Dev: runserver
# - Prod: gunicorn
#
# IMPORTANT:
#  - Render requires binding to $PORT (not fixed 8000)
#  - If you use Channels/WebSockets: prefer ASGI (uvicorn worker)
# -----------------------------------------------------------------------------
DJ_DEBUG_LOWER="$(echo "${DJANGO_DEBUG}" | tr '[:upper:]' '[:lower:]')"

if [[ "${DJ_DEBUG_LOWER}" == "true" || "${DJANGO_DEBUG}" == "1" ]]; then
  echo "🚀 Mode développement: runserver"
  exec python manage.py runserver 0.0.0.0:${PORT}
else
  if command -v gunicorn >/dev/null 2>&1; then
    echo "🚀 Mode production: gunicorn"

    # ✅ ASGI si Channels (recommandé)
    if python -c "import importlib; import sys; sys.exit(0 if importlib.util.find_spec('channels') else 1)" >/dev/null 2>&1; then
      # Remplace "backend.asgi:application" si ton module ASGI a un autre chemin
      # D'après ton log précédent tu avais "backend.asgi:application", ici je mets "seasky.asgi:application"
      # -> Choisis le bon: si ton projet Django s'appelle "seasky", garde seasky.asgi
      ASGI_APP="${ASGI_APPLICATION:-seasky.asgi:application}"
      exec gunicorn "$ASGI_APP" \
        -k uvicorn.workers.UvicornWorker \
        --bind 0.0.0.0:${PORT} \
        --workers "${WEB_CONCURRENCY:-1}" \
        --timeout 120
    else
      # WSGI classique
      exec gunicorn seasky.wsgi:application \
        --bind 0.0.0.0:${PORT} \
        --workers "${WEB_CONCURRENCY:-3}" \
        --threads 2 \
        --timeout 120
    fi
  else
    echo "⚠️ gunicorn absent → fallback runserver"
    exec python manage.py runserver 0.0.0.0:${PORT}
  fi
fi
