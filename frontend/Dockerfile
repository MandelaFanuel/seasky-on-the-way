FROM node:20-alpine

LABEL maintainer="SeaSky Team <dev@seasky.bi>"
LABEL version="1.0.0"
LABEL description="SeaSky Platform Frontend"

ENV NODE_ENV=development \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    HOST=0.0.0.0 \
    PORT=5173

WORKDIR /app

COPY package.json package-lock.json* ./

# ✅ Install deps (no wget, no apk)
RUN npm install --no-audit --fund=false

COPY . .

EXPOSE 5173

# ✅ Healthcheck sans wget/curl (zéro dépendance réseau apk)
HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s \
  CMD node -e "fetch('http://localhost:5173').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
