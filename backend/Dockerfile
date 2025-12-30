FROM python:3.12-slim

LABEL maintainer="SeaSky Team <dev@seasky.bi>"
LABEL version="1.0.0"
LABEL description="SeaSky Platform Backend API"

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive \
    PYTHONPATH=/app \
    DJANGO_SETTINGS_MODULE=seasky.settings

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
      curl \
      ca-certificates \
      build-essential \
      python3-dev \
      libpq-dev \
      postgresql-client \
      netcat-traditional \
      iputils-ping \
      nano \
      vim-tiny \
      less \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN groupadd -r django && \
    useradd -r -g django -d /app -s /bin/bash django && \
    mkdir -p /app && \
    chown -R django:django /app

WORKDIR /app

COPY --chown=django:django requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt && \
    python -c "import django; print(f'Django {django.__version__} installé')"

COPY --chown=django:django . .

# ✅ Dossiers runtime
RUN mkdir -p /app/staticfiles /app/media /app/logs && \
    chown -R django:django /app/staticfiles /app/media /app/logs && \
    chmod -R 775 /app/staticfiles /app/media /app/logs

# ✅ start.sh doit exister dans backend/ (même dossier que Dockerfile)
RUN test -f /app/start.sh && chmod +x /app/start.sh

USER django

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s \
  CMD curl -fsS http://localhost:8000/api/health/ >/dev/null || exit 1

CMD ["/app/start.sh"]
