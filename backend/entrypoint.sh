#!/usr/bin/env bash
set -e

echo "================================================"
echo "🚀 SeaSky Platform - Initialisation du Backend"
echo "================================================"

# ========================= VÉRIFICATION DES VARIABLES =========================
echo "🔍 Vérification des variables d'environnement..."

# Variables requises
REQUIRED_VARS=("DJANGO_SECRET_KEY" "POSTGRES_DB" "POSTGRES_USER" "POSTGRES_PASSWORD")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Variables d'environnement manquantes: ${MISSING_VARS[*]}"
    echo "   Veuillez les définir dans le fichier .env"
    exit 1
fi

echo "✅ Toutes les variables requises sont définies"

# ========================= ATTENTE DE POSTGRES =========================
echo ""
echo "⏳ Attente de PostgreSQL $POSTGRES_HOST:$POSTGRES_PORT..."

timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if PGPASSWORD="$POSTGRES_PASSWORD" psql \
        -h "$POSTGRES_HOST" \
        -p "$POSTGRES_PORT" \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -c '\q' 2>/dev/null; then
        echo "✅ Connexion à PostgreSQL réussie"
        break
    fi
    
    counter=$((counter + 2))
    echo "⏳ Tentative $counter/$timeout - PostgreSQL n'est pas encore prêt..."
    sleep 2
done

if [ $counter -ge $timeout ]; then
    echo "❌ Timeout: Impossible de se connecter à PostgreSQL après $timeout secondes"
    exit 1
fi

# ========================= MIGRATIONS SÉCURISÉES =========================
echo ""
echo "📦 Gestion des migrations..."

# Étape 1: Vérifier si c'est la première installation
FIRST_RUN=false
if ! PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'django_migrations')" 2>/dev/null | grep -q "t"; then
    echo "  🔎 Première installation détectée"
    FIRST_RUN=true
fi

# Étape 2: Migrations pour accounts en premier (sans admin)
if [ "$FIRST_RUN" = true ]; then
    echo "  🛠️  Configuration initiale des modèles..."
    
    # Créer un script Python temporaire pour migrer accounts sans admin
    python3 - << 'PYTHON_SCRIPT'
import os
import sys

# Configuration minimale sans admin
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'seasky.settings')

# Modifier temporairement les settings
import django
from django.conf import settings

# Apps minimales pour la migration initiale
minimal_apps = [
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'apps.accounts',
    'apps.suppliers',
    'apps.drivers',
    'apps.pdv',
    'apps.logistics',
    'apps.qr',
]

settings.INSTALLED_APPS = minimal_apps

# Initialiser Django
try:
    django.setup()
    print("✅ Django configuré avec succès")
except Exception as e:
    print(f"❌ Erreur configuration Django: {e}")
    sys.exit(1)

# Créer les migrations
from django.core.management import execute_from_command_line

print("🛠️  Création des migrations...")
try:
    execute_from_command_line(['manage.py', 'makemigrations', 'accounts', '--noinput'])
    execute_from_command_line(['manage.py', 'makemigrations', '--noinput'])
    print("✅ Migrations créées avec succès")
except Exception as e:
    print(f"⚠️  Note: {e}")

print("🔄 Application des migrations...")
try:
    execute_from_command_line(['manage.py', 'migrate', '--noinput'])
    print("✅ Migrations appliquées avec succès")
except Exception as e:
    print(f"❌ Erreur migration: {e}")
    sys.exit(1)
PYTHON_SCRIPT
fi

# Étape 3: Migrations normales
echo "  🔄 Application des migrations Django..."
python manage.py migrate --noinput 2>&1 | grep -v "DEBUG" | while IFS= read -r line; do
    echo "    $line"
done

# Vérification
echo "  📊 État des migrations:"
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'seasky.settings')
import django
django.setup()
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute(\"SELECT app, COUNT(*) FROM django_migrations GROUP BY app\")
    for app, count in cursor.fetchall():
        print(f'    • {app}: {count} migration(s)')
"

# ========================= SUPERUTILISATEUR =========================
echo ""
echo "👑 Configuration du superutilisateur..."

python3 - << 'PYTHON_SCRIPT'
import os
os.environ.setdefault('DJANGO_SETTINGS_MODEL', 'seasky.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@seasky.bi')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'Admin123!')

try:
    # Vérifier si l'utilisateur existe
    user_exists = User.objects.filter(username=username).exists()
    
    if not user_exists:
        print(f"  🏗️  Création du superutilisateur '{username}'...")
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"  ✅ Superutilisateur '{username}' créé")
        
        # Afficher les informations (sans le mot de passe)
        user = User.objects.get(username=username)
        print(f"  📋 Informations:")
        print(f"     • Username: {user.username}")
        print(f"     • Email: {user.email}")
        print(f"     • Date création: {user.date_joined}")
    else:
        print(f"  ✅ Superutilisateur '{username}' existe déjà")
        
except Exception as e:
    print(f"  ⚠️  Erreur: {e}")
    print(f"  💡 Astuce: Créez manuellement avec: python manage.py createsuperuser")
PYTHON_SCRIPT

# ========================= FICHIERS STATIQUES =========================
echo ""
echo "📁 Préparation des fichiers statiques..."
python manage.py collectstatic --noinput --clear 2>&1 | tail -3

# ========================= VÉRIFICATION FINALE =========================
echo ""
echo "🔍 Vérification finale..."

python3 - << 'PYTHON_SCRIPT'
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'seasky.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from django.db import connection

print("  📊 Statistiques système:")
try:
    User = get_user_model()
    user_count = User.objects.count()
    print(f"    • Utilisateurs dans la base: {user_count}")
except Exception as e:
    print(f"    • Erreur comptage utilisateurs: {e}")

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
        table_count = cursor.fetchone()[0]
        print(f"    • Tables PostgreSQL: {table_count}")
        
        cursor.execute("SELECT version()")
        pg_version = cursor.fetchone()[0].split()[1]
        print(f"    • PostgreSQL version: {pg_version}")
except Exception as e:
    print(f"    • Erreur vérification base: {e}")

print("  ✅ Système prêt!")
PYTHON_SCRIPT

# ========================= DÉMARRAGE DU SERVEUR =========================
echo ""
echo "================================================"
echo "🌐 Démarrage du serveur SeaSky"
echo "================================================"
echo "📡 Accès:"
echo "  • Backend API:  http://localhost:8000/api/v1/"
echo "  • Admin Django: http://localhost:8000/admin/"
echo "  • Swagger UI:   http://localhost:8000/api/schema/swagger-ui/"
echo "  • ReDoc:        http://localhost:8000/api/schema/redoc/"
echo ""
echo "🔧 Mode: ${DJANGO_DEBUG:-Production}"
echo "🐍 Python: $(python --version)"
echo "🔄 Django: $(python -c 'import django; print(django.__version__)')"
echo "================================================"

# Démarrer Gunicorn (production) ou runserver (développement)
if [ "${DJANGO_DEBUG,,}" = "true" ] || [ "${DJANGO_DEBUG}" = "1" ]; then
    echo "🚀 Mode développement: Démarrage de runserver..."
    exec python manage.py runserver 0.0.0.0:8000
else
    echo "🚀 Mode production: Démarrage de Gunicorn..."
    exec gunicorn seasky.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 4 \
        --threads 2 \
        --timeout 120 \
        --log-level info \
        --access-logfile - \
        --error-logfile - \
        --worker-class sync
fi