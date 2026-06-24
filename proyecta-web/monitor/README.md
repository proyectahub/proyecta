# Monitor Local Divulgaría

## Archivo principal

`I:\MDATOS2.0\nova-scientia-web\monitor\nova-monitor-local.html`

## Que monitorea

- Estado de API y latencia.
- Perfiles registrados.
- Publicaciones totales y nuevas en 24h.
- Ingresos a la pagina (estimados).
- Usuarios conectados ahora (estimados).
- Revisiones y comentarios.
- Autores activos y conversion perfil -> autor.
- Interacciones y entradas estimadas.
- Tabla de publicaciones recientes.

## Modo recomendado (con auto-recuperacin)

1. En PowerShell:
   `cd I:\MDATOS2.0\nova-scientia-web\monitor`
2. Ejecuta:
   `powershell -ExecutionPolicy Bypass -File .\start-monitor.ps1`
3. Abre:
   `http://127.0.0.1:8099/nova-monitor-local.html`

`start-monitor.ps1` levanta `monitor-bridge.mjs` en `localhost:8099`.
Con eso, el monitor puede:

- Ver estado de vigilancia local.
- Lanzar `Reactivar API ahora` desde UI.
- Activar `Auto-reactivar si cae API`.
- Correr `Diagnostico API` desde UI.

## Flujo automatico de reactivacion

- Script de vigilancia: `I:\MDATOS2.0\nova-scientia-web\scripts\watch-cloudflare-backend.ps1`
- Si detecta API publica caida, intenta refrescar tunel y redeploy del worker estable.
- Log de vigilancia: `I:\MDATOS2.0\nova-scientia-web\.cloudflare-runtime\backend-watch.log`

## Nota de "cuantos entran"

La API publica actual no expone un contador directo de visitas al portal.
Por eso el monitor muestra **Entradas Estimadas** con un modelo didactico:

`max(perfiles*12, publicaciones*35, interacciones*7)`

Puedes reemplazar este calculo cuando habilites una fuente real de trafico (Cloudflare Analytics, GA4, etc.).
