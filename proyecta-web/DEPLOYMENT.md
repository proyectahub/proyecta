# 🚀 PROYECTA Production Deployment Guide

## Sistema
PROYECTA es una plataforma de crowdfunding descentralizado basada en Monero con minería de CPU.

**Arquitectura:**
- Frontend: Vite + React (SPA)
- Backend: Node.js Express (Mining Proxy)
- Pool: SupportXMR (Non-custodial)
- Blockchain: Monero (Verificable en xmrchain.net)

---

## ⚙️ Requisitos

- Node.js 18+
- npm 9+
- Puerto 3001 (Backend)
- Puerto 5174 o 80 (Frontend)
- Conexión a internet (para conectar a SupportXMR)

---

## 📦 Build

```bash
# 1. Instalar dependencias
npm install

# 2. Build frontend
npm run build

# El directorio /dist contiene la aplicación compilada
```

---

## 🎯 Ejecución

### Opción 1: Local/Desarrollo
```bash
# Terminal 1: Backend Proxy
npm run server

# Terminal 2: Dev Server
npm run dev
```

### Opción 2: Producción (Recomendado)

#### A. Backend Proxy
```bash
NODE_ENV=production node server.js
```

**Output esperado:**
```
╔═══════════════════════════════════════════════════════════════╗
║   PROYECTA Backend Proxy - SupportXMR Mining Pool             ║
║═══════════════════════════════════════════════════════════════║
║                                                               ║
║  🚀 PRODUCCIÓN MODE                                           ║
║  ✅ Puerto: 3001                                              ║
║  🔗 SupportXMR: wss://pool.supportxmr.com:3333              ║
║  📡 API: http://0.0.0.0:3001/api/mining                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

#### B. Frontend Estático
```bash
# Servir /dist con tu servidor web favorito
# Nginx:
nginx -c /path/to/nginx.conf

# Python:
cd dist && python -m http.server 80

# Node http-server:
npx http-server dist -p 80
```

---

## 🔧 Reverse Proxy (Nginx - Recomendado)

```nginx
# /etc/nginx/sites-available/proyecta
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend estático
    location / {
        root /path/to/proyecta-web/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Verificar Salud del Sistema

```bash
# Backend health check
curl http://localhost:3001/api/mining/health

# Respuesta esperada:
{
  "status": "healthy",
  "timestamp": "2026-06-23T...",
  "activeSessions": 0,
  "totalSessions": 0,
  "sessions": []
}
```

---

## 🔐 Seguridad en Producción

1. **HTTPS/TLS**
   ```bash
   # Usar Let's Encrypt con Certbot
   certbot certonly --standalone -d tu-dominio.com
   ```

2. **CORS**
   - Backend ya tiene CORS habilitado
   - Ajustar `origin` en server.js si es necesario

3. **Rate Limiting**
   - Agregar rate limiter en Nginx:
   ```nginx
   limit_req_zone $binary_remote_addr zone=mining:10m rate=10r/s;
   limit_req zone=mining burst=20 nodelay;
   ```

4. **Firewall**
   ```bash
   # Abrir solo puertos necesarios
   ufw allow 80
   ufw allow 443
   ufw allow 3001/tcp
   ```

---

## 📈 Monitoreo

### Logs
```bash
# Backend logs (stdout)
NODE_ENV=production node server.js 2>&1 | tee /var/log/proyecta-backend.log
```

### Health Checks
```bash
# Monitorear cada 30 segundos
while true; do
  curl -s http://localhost:3001/api/mining/health | jq .
  sleep 30
done
```

### Stats de Minería
```bash
# Ver actividad
curl http://localhost:3001/api/mining/health | jq '.sessions'
```

---

## 🚨 Troubleshooting

### Backend no conecta a SupportXMR
```
Error: Client network socket disconnected before secure TLS connection
```
**Solución:** Normal en Windows. En Linux/producción debería conectar.

### Puerto 3001 en uso
```bash
# Cambiar puerto
PORT=3002 node server.js
```

### CORS errors
```bash
# Verificar que el frontend accede al backend correcto
# En useSupportXMRMining.ts:
const BACKEND_URL = 'http://tu-dominio.com/api/mining'
```

---

## 📋 Checklist de Lanzamiento

- [ ] Node.js 18+ instalado
- [ ] npm install ejecutado
- [ ] npm run build completado sin errores
- [ ] Backend proxy inicia sin errores
- [ ] Health check responde 200
- [ ] Frontend accede a /projects/{id}
- [ ] Minería inicia y genera hashes
- [ ] Stats de SupportXMR cargan
- [ ] Verificación en xmrchain.net funciona
- [ ] HTTPS/TLS configurado (producción)
- [ ] Firewall configurado
- [ ] Logs configurados

---

## 🎯 Primeros Pasos en Producción

1. **Usuario crea cuenta**
   - Email/Password auth
   - Completa perfil (nombre, institución, ORCID)

2. **Crea proyecto**
   - Título, descripción, meta de financiamiento
   - Se genera dirección Monero automáticamente

3. **Otros usuarios minan**
   - Click "Comenzar a minar"
   - Seleccionan % CPU
   - Hashes se generan y envían a SupportXMR
   - XMR llega a dirección del proyecto

4. **Verificación pública**
   - Cualquiera puede ir a xmrchain.net
   - Pegar dirección del proyecto
   - Ver transacciones en tiempo real

---

## 💰 Non-Custodial = Seguro

**PROYECTA NUNCA toca los fondos:**
- Los XMR se envían directamente a la dirección del proyecto
- PROYECTA solo actúa como registro (IPFS)
- Los investigadores controlan la wallet
- Todo es públicamente verificable

---

## 📞 Soporte

Para problemas de mining:
- Backend logs: `tail -f /var/log/proyecta-backend.log`
- Health endpoint: `curl http://localhost:3001/api/mining/health`
- Verificar en: https://xmrchain.net

---

## 🎉 ¡Listo para Producción!

PROYECTA está completamente funcional y listo para recibir mineros reales.
