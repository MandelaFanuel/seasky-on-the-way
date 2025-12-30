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

RUN apk add --no-cache wget

COPY package.json package-lock.json* ./

# ✅ Ne bloque pas l'image si le réseau est lent: install simple
RUN npm install --no-audit --fund=false

COPY . .

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
