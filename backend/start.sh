#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo "🚀 SeaSky Platform - Initialisation du Backend"
echo "================================================"

: "${PORT:=8000}"
: "${DJANGO_DEBUG:=false}"

# -------------------------------------------------------------------
# ✅ Détection Render
# -------------------------------------------------------------------
IS_RENDER="false"
if [[ -n "${RENDER:-}" || -n "${RENDER_SERVICE_ID:-}" ]]; then
  IS_RENDER="true"
fi

# -------------------------------------------------------------------
# ✅ Nettoyage / lecture env
# -------------------------------------------------------------------
DATABASE_URL="$(echo "${DATABASE_URL:-}" | xargs || true)"

# Fallback local/docker-compose
: "${POSTGRES_HOST:=db}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_DB:=seasky}"
: "${POSTGRES_USER:=fanuel045}"
: "${POSTGRES_PASSWORD:=414141}"

# -------------------------------------------------------------------
# ✅ Mode Render strict: DATABASE_URL recommandé (souvent obligatoire)
# -------------------------------------------------------------------
if [[ "$IS_RENDER" == "true" && -z "${DATABASE_URL}" ]]; then
  echo "❌ Render détecté mais DATABASE_URL est vide."
  echo "👉 Render > seasky-backend > Environment : ajoute DATABASE_URL (Internal Database URL) puis redeploy."
  exit 1
fi

# -------------------------------------------------------------------
# ✅ Choix URL DB selon environnement
# -------------------------------------------------------------------
if [[ -n "${DATABASE_URL}" ]]; then
  DB_URL="${DATABASE_URL}"
else
  DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
fi

# ✅ IMPORTANT: Django lit DATABASE_URL (pas DB_URL)
export DATABASE_URL="${DB_URL}"

# Affiche un résumé DATABASE_URL sans password
python - <<'PY'
import os
u = (os.environ.get("DATABASE_URL","") or "").strip()
safe = u
if "://" in u and "@" in u:
    proto, rest = u.split("://",1)
    creds, host = rest.split("@",1)
    user = creds.split(":",1)[0] if ":" in creds else creds
    safe = f"{proto}://{user}:***@{host}"
print("🔎 Debug env:")
print("  • IS_RENDER =", "true" if (os.getenv("RENDER") or os.getenv("RENDER_SERVICE_ID")) else "false")
print("  • RENDER_SERVICE_ID =", os.getenv("RENDER_SERVICE_ID","<empty>"))
print("  • DATABASE_URL =", "***set***" if os.getenv("DATABASE_URL") else "<empty>")
print("  • DATABASE_URL(safe) =", safe if safe else "<empty>")
print("  • PORT =", os.getenv("PORT","8000"))
print("  • DJANGO_DEBUG =", os.getenv("DJANGO_DEBUG","<empty>"))
PY

echo ""
echo "⏳ Attente de PostgreSQL (test réel via psycopg)..."

# -------------------------------------------------------------------
# ✅ Attente DB via psycopg
# -------------------------------------------------------------------
python - <<'PY'
import os, sys, time
import psycopg

db_url = (os.environ.get("DATABASE_URL") or "").strip()
if not db_url:
    print("❌ DATABASE_URL vide. Configure DATABASE_URL (Render) ou POSTGRES_* (local).")
    sys.exit(1)

last_err = None
for i in range(1, 61):
    try:
        with psycopg.connect(db_url, connect_timeout=5) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
        print(f"✅ PostgreSQL prêt (connexion OK) (try {i}/60)")
        sys.exit(0)
    except Exception as e:
        last_err = e
        print(f"⌛ ({i}/60) DB pas prête... ({type(e).__name__})")
        time.sleep(2)

print("❌ Impossible de se connecter à PostgreSQL après 60 essais.")
print("   Dernière erreur:", repr(last_err))
print("   👉 Render: vérifie DATABASE_URL dans le service backend + même région que la DB.")
sys.exit(1)
PY

echo ""
echo "🔄 Migrations..."
python manage.py migrate --noinput

echo ""
echo "📁 Collectstatic..."
python manage.py collectstatic --noinput --clear || true

# -------------------------------------------------------------------
# ✅ Création automatique d'un superuser admin (Render-friendly)
# -------------------------------------------------------------------
# Utilisation:
#   DJANGO_SUPERUSER_USERNAME=admin
#   DJANGO_SUPERUSER_EMAIL=admin@seasky.bi
#   DJANGO_SUPERUSER_PASSWORD=XXXX
# Optionnel:
#   DJANGO_SUPERUSER_CREATE=1  (si tu veux forcer)
#
# Comportement:
# - crée le superuser seulement s'il n'existe pas
# - ne casse pas le démarrage si variables absentes
echo ""
echo "👤 Vérification / création du Superuser (admin)..."

python - <<'PY'
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", os.getenv("DJANGO_SETTINGS_MODULE","seasky.settings"))
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

create_flag = (os.getenv("DJANGO_SUPERUSER_CREATE","") or "").strip().lower() in ("1","true","yes","on")
username = (os.getenv("DJANGO_SUPERUSER_USERNAME","") or "").strip()
email = (os.getenv("DJANGO_SUPERUSER_EMAIL","") or "").strip()
password = (os.getenv("DJANGO_SUPERUSER_PASSWORD","") or "").strip()

# On crée si:
# - flag activé OU (en prod Render et variables fournies)
is_render = bool(os.getenv("RENDER") or os.getenv("RENDER_SERVICE_ID"))
should_try = create_flag or (is_render and username and password)

if not should_try:
    print("ℹ️ Superuser: non demandé (variables absentes ou flag non activé).")
    raise SystemExit(0)

if not username or not password:
    print("⚠️ Superuser: DJANGO_SUPERUSER_USERNAME et DJANGO_SUPERUSER_PASSWORD requis.")
    raise SystemExit(0)

# Déjà existant ?
existing = User.objects.filter(username=username).first()
if existing:
    # Optionnel: s'assurer qu'il est staff/superuser
    changed = False
    if not getattr(existing, "is_staff", False):
        existing.is_staff = True
        changed = True
    if not getattr(existing, "is_superuser", False):
        existing.is_superuser = True
        changed = True
    if changed:
        existing.save(update_fields=["is_staff","is_superuser"])
        print(f"✅ Superuser '{username}' déjà existant — droits renforcés (staff/superuser).")
    else:
        print(f"✅ Superuser '{username}' existe déjà.")
    raise SystemExit(0)

# Créer
u = User.objects.create_superuser(username=username, email=email or None, password=password)
print(f"✅ Superuser créé: {u.username}")
PY

echo ""
echo "================================================"
echo "🌐 Démarrage du serveur SeaSky"
echo "================================================"

# Normalise debug
DJ_DEBUG_LOWER="$(echo "${DJANGO_DEBUG}" | tr '[:upper:]' '[:lower:]')"

# -------------------------------------------------------------------
# ✅ Serveur: dev => runserver ; prod => gunicorn
# -------------------------------------------------------------------
if [[ "${DJ_DEBUG_LOWER}" == "true" || "${DJANGO_DEBUG}" == "1" ]]; then
  echo "🧪 Mode DEV: runserver"
  exec python manage.py runserver 0.0.0.0:${PORT}
else
  echo "🚀 Mode PROD: gunicorn"
  if command -v gunicorn >/dev/null 2>&1; then
    exec gunicorn seasky.wsgi:application \
      --bind 0.0.0.0:${PORT} \
      --workers "${WEB_CONCURRENCY:-1}" \
      --threads "${GUNICORN_THREADS:-2}" \
      --timeout "${GUNICORN_TIMEOUT:-120}" \
      --access-logfile "-" \
      --error-logfile "-"
  else
    echo "⚠️ gunicorn introuvable, fallback runserver"
    exec python manage.py runserver 0.0.0.0:${PORT}
  fi
fi
