# Deploy inicial a Cloudflare para DivulgarÃ­a

## Criterio recomendado

Para no romper el trabajo local, la mejor ruta hoy es:

1. Subir **solo el frontend** a Cloudflare Pages.
2. Probar la experiencia publica con una URL `pages.dev`.
3. Mantener el backend actual en local o exponerlo temporalmente con un tunel.
4. Migrar el backend despues a una capa compatible con Cloudflare (`Workers` + `D1` o similar).

## Por que esta ruta es la mÃ¡s segura

El frontend ya es una SPA de Vite y se publica muy bien en Cloudflare Pages.

El backend actual usa:

- `Express`
- sesiÃ³nes en memoria
- y un archivo local `backend/data/store.json`

Ese almacenamiento local no es una base adecuada para un despliegue real en Cloudflare. Sirve en local, pero no como capa persistente de produccion.

## Lo que ya queda preparado en este proyecto

- `wrangler` instalado como dependencia de desarrollo
- scripts para autenticar y publicar en Pages
- ejemplo de entorno de produccion en `.env.production.example`

## Scripts disponibles

```bash
npm run cf:login
npm run cf:whoami
npm run cf:pages:create
npm run cf:pages:deploy
npm run cf:pages:preview
```

## Fase 1: publicar el frontend en Cloudflare Pages

### Opcion A: desde terminal con Wrangler

1. Entra al proyecto:

```bash
cd I:\MDATOS2.0\nova-scientia-web
```

2. Inicia sesiÃ³n en Cloudflare:

```bash
npm run cf:login
```

3. Crea el proyecto de Pages si aún no existe:

```bash
npm run cf:pages:create
```

Sugerencia de nombre:

- `nova-scientia`

4. Construye y despliega:

```bash
npm run cf:pages:deploy
```

5. Para una subida de prueba separada:

```bash
npm run cf:pages:preview
```

### Opcion B: desde el panel de Cloudflare

Si prefieres hacerlo por interfaz:

- Build command: `npm run build`
- Build output directory: `dist`
- Framework preset: `Vite`

## Variable de entorno del frontend

En Cloudflare Pages define:

- `VITE_API_URL`

Ejemplo:

```env
VITE_API_URL=https://tu-backend-público.ejemplo.com
```

Mientras no exista un backend público, puedes hacer pruebas visuales del frontend, pero las funciones con datos reales no responderan fuera de local.

## Fase 1.5: exponer temporalmente el backend sin migrarlo aún

Si quieres vÃ¡lidar formularios, login y feed real antes de migrar el backend, usa un tunel temporal y apunta `VITE_API_URL` a esa URL publica.

Opciones practicas:

- `ngrok`
- `Cloudflare Tunnel`

Esto permite seguir trabajando igual en local sin tocar el backend productivo todav?a.

## Fachada estable para la API

En este proyecto ya dejamos una capa publica fija:

- frontend: `https://divulgaria.pages.dev`
- API pública: `https://nova-scientia-api.novascientiaapi.workers.dev`

La API pública estable vive en un `Worker` de Cloudflare y reenvia peticiones al backend local.

### Importante

Sin dominio propio en Cloudflare, el tunel del backend sigue siendo temporal (`trycloudflare.com`).

Eso significa:

- la URL del frontend no cambia
- la URL publica de la API no cambia
- pero el origen interno del `Worker` si puede cambiar cuando reinicias el tunel local

Por eso dejamos este comando:

```bash
npm run cf:api:refresh-tunnel
```

Ese flujo hace tres cosas:

1. vÃ¡lida que tu backend local en `http://localhost:3000` este activo
2. levanta un quick tunnel nuevo con `cloudflared`
3. actualiza `BACKEND_ORIGIN` en el `Worker` y vuelve a desplegar el proxy estable

### Flujo recomendado cuando cambie el tunel

1. Inicia el backend local:

```bash
cd backend
node index.js
```

2. En otra terminal, desde la raiz del frontend:

```bash
cd I:\MDATOS2.0\nova-scientia-web
npm run cf:api:refresh-tunnel
```

3. Prueba:

- `https://divulgaria.pages.dev`
- `https://nova-scientia-api.novascientiaapi.workers.dev/api/health`

Con esto no necesitas volver a desplegar Pages cada vez que cambie el tunnel del backend.

## Fase 2: backend compatible con Cloudflare

Antes de mover el backend a Cloudflare conviene hacer estas migraciones:

1. Reemplazar `backend/data/store.json` por una base persistente.
2. Mover sesiÃ³nes y usuarios a una capa durable.
3. Adaptar la API a `Workers` o a una arquitectura equivalente.

La ruta mÃ¡s natural para DivulgarÃ­a seria:

- frontend en `Pages`
- API en `Workers`
- datos en `D1`
- imagenes en `R2` cuando haga falta

## Que se preserva con esta estrategia

- tu flujo actual local
- tu `VITE_API_URL=http://localhost:3000`
- el frontend tal como ya lo venimos afinando
- la posibilidad de probar en una URL publica antes de comprar dominio

## Recomendacion operativa

Emart?culo por Pages ahora mismo.

No subas todav?a el backend actual a Cloudflare como si ya fuera productivo.

Primero vÃ¡lidamos:

- inicio
- feed
- lectura
- perfil
- editor

Y luego hacemos una migración limpia de la capa de datos.
