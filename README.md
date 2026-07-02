# PROYECTA

Portal de ciencia abierta y publicación comunitaria con soporte para identidad verificada, artículos, revisión, perfiles y un módulo opcional de donación de cómputo/minería para sostener infraestructura.

## Qué contiene
- `proyecta-web/` - frontend principal en React + Vite
- `proyecta-web/backend/` - backend de autenticación, artículos, perfiles y ORCID
- `proyecta-web/server.js` - proxy de minería/Soporte a SupportXMR
- `proyecta-desktop/` - app de escritorio Tauri relacionada con el portal
- `proyecta-miner-launcher/` - scripts de lanzamiento de minería nativa

## Objetivo del portal
- Publicar artículos y proyectos científicos
- Gestionar identidad con login, registro y ORCID
- Dar soporte a revisión y comunidad
- Mantener una ruta de financiamiento comunitario transparente

## Desarrollo local
```bash
cd proyecta-web
npm install
npm run dev
```

## Verificación
- Frontend: `http://localhost:5173`
- Backend local: `http://localhost:3000`
- Proxy/minería local: `http://localhost:3001`

## Despliegue
- Cloudflare Pages para el frontend
- Railway o backend propio para la API
- Variables de entorno documentadas en `proyecta-web/.env.production.example`
