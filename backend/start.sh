#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo "🚀 SeaSky Platform - Initialisation du Backend"
echo "================================================"

# Defaults (si non fournis)
: "${POSTGRES_HOST:=db}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_DB:=seasky}"
: "${POSTGRES_USER:=fanuel045}"
: "${POSTGRES_PASSWORD:=414141}"
: "${DJANGO_DEBUG:=false}"

echo "🔍 Variables:"
echo "  • POSTGRES_HOST=$POSTGRES_HOST"
echo "  • POSTGRES_PORT=$POSTGRES_PORT"
echo "  • POSTGRES_DB=$POSTGRES_DB"
echo "  • POSTGRES_USER=$POSTGRES_USER"
echo "  • DJANGO_DEBUG=$DJANGO_DEBUG"

echo ""
echo "⏳ Attente de PostgreSQL (test réel avec psql + password)..."

for i in $(seq 1 60); do
  if PGPASSWORD="$POSTGRES_PASSWORD" psql \
      -h "$POSTGRES_HOST" \
      -p "$POSTGRES_PORT" \
      -U "$POSTGRES_USER" \
      -d "$POSTGRES_DB" \
      -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ PostgreSQL prêt (connexion OK)"
    break
  fi
  echo "⌛ ($i/60) DB pas prête..."
  sleep 2
done

# Si après 60 essais ça ne passe pas : exit (évite boucle infinie)
if ! PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -c "SELECT 1;" >/dev/null 2>&1; then
  echo "❌ Impossible de se connecter à PostgreSQL."
  echo "   Vérifie POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB et le host '$POSTGRES_HOST'."
  exit 1
fi

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
echo "  • Backend API:  http://localhost:8000/api/v1/"
echo "  • Admin Django: http://localhost:8000/admin/"
echo "================================================"

# Dev => runserver, Prod => gunicorn si dispo
if [[ "${DJANGO_DEBUG,,}" == "true" || "${DJANGO_DEBUG}" == "1" ]]; then
  echo "🚀 Mode développement: runserver"
  exec python manage.py runserver 0.0.0.0:8000
else
  if command -v gunicorn >/dev/null 2>&1; then
    echo "🚀 Mode production: gunicorn"
    exec gunicorn seasky.wsgi:application \
      --bind 0.0.0.0:8000 \
      --workers 3 \
      --threads 2 \
      --timeout 120
  else
    echo "⚠️ gunicorn absent → fallback runserver"
    exec python manage.py runserver 0.0.0.0:8000
  fi
fi
