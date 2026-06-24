# Despliegue del Proxy de Minería RandomX (PROYECTA)

Este proxy es el puente **WebSocket ⇄ TCP Stratum** que permite que el navegador
mine RandomX real contra SupportXMR. Los navegadores no pueden abrir sockets TCP,
y muchos ISP/redes (incluida la del entorno de desarrollo) **bloquean el puerto
Stratum**, por eso el proxy debe correr en un servidor cuya red **sí** permita
salida TCP al pool.

```
Navegador (RandomX WASM) --WSS--> [Proxy en VPS] --TCP Stratum--> SupportXMR --> Blockchain Monero
```

---

## 0. Antes de nada: comprueba que el VPS NO bloquea el Stratum

En el servidor donde vas a desplegar, ejecuta:

```bash
node -e 'const n=require("net");const s=n.connect({host:"pool.supportxmr.com",port:3333},()=>{s.write(JSON.stringify({id:1,jsonrpc:"2.0",method:"login",params:{login:"42gfB3ayxZV2VNH8KAsUMU5fcXUqd83BGJneR37KqJaBQuzYJ8w5d3aV5DBkFH2oWo9YzJLcjhv2d5dR4V2C2xFrUGKiePh",pass:"x",agent:"test",algo:["rx/0"]}})+"\n")});s.setEncoding("utf8");s.on("data",d=>{console.log("RESPUESTA OK:",d.slice(0,80));process.exit(0)});s.on("close",()=>{console.log("CERRADO sin respuesta = Stratum BLOQUEADO");process.exit(1)});setTimeout(()=>{console.log("timeout");process.exit(1)},8000)'
```

- Si imprime **`RESPUESTA OK: {...job...}`** → el VPS sirve, continúa.
- Si imprime **`CERRADO sin respuesta`** → ese host también bloquea Stratum; usa otro proveedor.

Proveedores que suelen permitir salida TCP a pools: Hetzner, Contabo, Vultr,
DigitalOcean, OVH, Fly.io, Railway. (Algunos hosts "serverless" la bloquean.)

---

## Opción A — Docker + Caddy (HTTPS/WSS automático)  ⭐ recomendada

Necesitas un **dominio** apuntando (registro A) a la IP del VPS y los puertos
80/443 abiertos.

```bash
# En el VPS, dentro del repo:
export PROXY_DOMAIN=mineria.tudominio.com
docker compose -f deploy/docker-compose.yml up -d --build
```

Caddy obtiene el certificado TLS solo. Verifica:

```bash
curl https://mineria.tudominio.com/api/mining/health
```

En el frontend, edita `.env`:

```
VITE_MINING_WS_URL=wss://mineria.tudominio.com/ws/mining
```

Reconstruye el frontend (`npm run build`) y vuelve a desplegarlo.

---

## Opción B — systemd (sin Docker)

```bash
sudo mkdir -p /opt/proyecta-proxy
sudo cp server.js /opt/proyecta-proxy/
sudo cp deploy/package.json /opt/proyecta-proxy/package.json
cd /opt/proyecta-proxy && sudo npm install --omit=dev

sudo cp deploy/proyecta-proxy.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now proyecta-proxy
curl http://localhost:3001/api/mining/health
```

Para HTTPS/WSS pon Caddy o Nginx delante apuntando a `localhost:3001`
(con `proxy_set_header Upgrade`/`Connection` si usas Nginx).

---

## Verificar que se está minando de verdad

1. Abre un proyecto, pulsa **Comenzar a minar**.
2. En la tarjeta verás **"Shares aceptados por el pool"** subir (cada share es PoW real validado).
3. Confírmalo en la API pública del pool:
   ```
   https://supportxmr.com/api/miner/<DIRECCION_DEL_PROYECTO>/stats
   ```
4. Cuando el balance supere 0.3 XMR, el pool paga a la dirección del proyecto,
   verificable en https://xmrchain.net/.

> ⚠️ RandomX en navegador rinde pocos H/s (es prueba de concepto, no minería
> rápida). Para volumen real se necesitarían muchos navegadores o mineros nativos.

---

## Local (desarrollo, sin pool)

Aunque tu red bloquee el Stratum, puedes comprobar que el **hashing RandomX es
real** con el botón **"Probar hashing RandomX real (local)"** en cada proyecto:
verifica el vector oficial de Monero y mide tu hashrate, todo en el navegador.

```bash
npm run dev      # frontend  → http://localhost:5174
npm run server   # proxy     → http://localhost:3001
```
