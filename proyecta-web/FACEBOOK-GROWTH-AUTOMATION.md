# Facebook Growth Automation (Divulgaría)

## Path del proyecto

`I:\MDATOS2.0\nova-scientia-web`

## Requisitos

1. `ZERNIO_API_KEY` en variable de entorno.
2. Perfil y cuenta de Facebook conectados en Zernio.
3. `adAccountId` configurado para campañas pagadas.

## Configuracion

1. Copia el archivo:
   `configs/facebook-growth-plan.example.json`
2. Edita:
   `profileId`, `accountId`, `adAccountId`, `pageUrl/pageId`, fechas y copies.

## Flujo recomendado

1. Ver cuentas Facebook conectadas:
   `npm run fb:accounts -- --config configs/facebook-growth-plan.example.json --pageUrl "https://www.facebook.com/profile.phpid=61590734152628"`
2. Generar URL de conexion OAuth si falta conectar pagina:
   `npm run fb:connect -- --config configs/facebook-growth-plan.example.json --headless`
3. Publicar calendario:
   `npm run fb:publish -- --config configs/facebook-growth-plan.example.json`
4. Crear boosts publicitarios desde publicaciones:
   `npm run fb:boost -- --config configs/facebook-growth-plan.example.json --postsReport <ruta-del-reporte-facebook-posts.json>`
5. Medir rendimiento:
   `npm run fb:metrics -- --config configs/facebook-growth-plan.example.json`

## Modo seguro (sin publicar)

Usa `--dry-run` para inspeccionar payloads antes de enviar:

`npm run fb:publish -- --config configs/facebook-growth-plan.example.json --dry-run`

`npm run fb:boost -- --config configs/facebook-growth-plan.example.json --dry-run`

## Salidas

Los resultados quedan en `reports/`:

- `facebook-accounts-*.json`
- `facebook-posts-*.json`
- `facebook-boost-*.json`
- `facebook-metrics-*.json`

## Nota importante

Si en login aparece "Modo local disponible", significa que la API de backend de Divulgaría no respondio.
Este flujo (`fb:*`) publica directo con Zernio API y no depende del login local del frontend.
