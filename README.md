# SeaSky On The Way — Web MVP (Dockerized)

Monorepo minimal **backend (Django+DRF+Channels+Celery)** et **frontend (React+TS via Vite)**, avec Postgres et Redis.  
Objectif: lancer rapidement le MVP (auth JWT, QR tokens, collectes, livraisons, attendance, temps réel basique).

## Démarrage rapide (dev)
1) Copie `.env.example` vers `.env` et ajuste les variables si besoin.
2) Lancer:
```bash
docker compose up --build
```
- Backend: http://localhost:8000
- API: http://localhost:8000/api/v1/
- Docs Swagger: http://localhost:8000/api/v1/schema/swagger-ui/
- Frontend (Vite dev): http://localhost:5173

> Le backend applique automatiquement les migrations au démarrage.

### Variables d'env
Voir `.env.example`. Par défaut, CORS autorise `http://localhost:5173`.

### Commandes utiles
```bash
# Ouvrir un shell Django
docker compose exec backend python manage.py shell

# Créer un superuser
docker compose exec backend python manage.py createsuperuser
```

## Structure
```
seasky-on-the-way/
  backend/            # Django 5 + DRF + Channels + Celery (placeholder)
  frontend/           # React + TS (Vite) + RTK Query + Redux Toolkit
  docker-compose.yml
  .env.example
```
