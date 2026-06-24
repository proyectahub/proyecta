# Proxy Stratum de PROYECTA — imagen mínima y autocontenida
# Build context = raíz del repo (proyecta-web/), para poder copiar server.js
FROM node:20-alpine

WORKDIR /app

# Instalar solo las dependencias del proxy (cache de capas)
COPY deploy/package.json ./package.json
RUN npm install --omit=dev

# Copiar el proxy
COPY server.js ./server.js

ENV PORT=3001
EXPOSE 3001

# Healthcheck contra el endpoint real
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/mining/health || exit 1

CMD ["node", "server.js"]
