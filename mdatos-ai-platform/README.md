# MDatos.ai Platform Workspace

Carpeta consolidada para reanudar el proyecto operativo de `MDatos.ai` sin mezclar el portal estático actual con la versión React recuperada.

## Estructura

- `backend/`
  - Integración con Vast.ai
  - API FastAPI con `GET /api/compute-options`
  - Esquema inicial de base de datos PostgreSQL
  - CLI operativo para `search`, `create`, `launch`, `list`, `show`, `destroy`
- `frontend/`
  - Base React + Vite recuperada
  - Punto recomendado para reconstruir `Mi Laboratorio`

## Estado actual

Backend listo en:

- `backend/app/config.py`
- `backend/app/main.py`
- `backend/app/integrations/vast_ai.py`
- `backend/app/services/compute_allocator.py`
- `backend/db/001_initial_schema.sql`
- `backend/scripts/vast_ai_cli.py`

Frontend recuperado en:

- `frontend/src/App.jsx`
- `frontend/src/main.jsx`
- `frontend/src/styles.css`

## Levantar backend

```powershell
cd I:\MDATOS2.0\mdatos-ai-platform\backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Opcional para desarrollo local, usar `backend/.env`:

```env
VAST_AI_API_KEY=tu_api_key
MDATOS_ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
```

## Levantar frontend

```powershell
cd I:\MDATOS2.0\mdatos-ai-platform\frontend
npm install
npm run dev
```

## Siguiente paso recomendado

Reconstruir la pantalla `Mi Laboratorio` dentro de `frontend/src/` y conectarla al backend actual en `backend/app/main.py`.
