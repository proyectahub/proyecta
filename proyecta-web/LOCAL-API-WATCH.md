# Vigilancia local de DivulgarÃ­a

Este proyecto ya tiene dos comandos listos para mantener viva la API pública de DivulgarÃ­a mientras tu computadora este encendida y el backend local pueda correr.

## Que hace cada comando

### 0. Ver estado rapido

```powershell
npm run cf:api:status
```

Te dice en segundos si:

- el backend local en `localhost:3000` sigue vivo
- la API pública estable de `pages.dev` sigue conectada
- conviene reactivar o no

### 1. Reactivar una vez

```powershell
npm run cf:api:reactivate
```

Este comando:

- revisa si el backend local responde en `http://localhost:3000/api/health`
- si no responde, intenta levantarlo desde `backend`
- crea un nuevo quick tunnel de Cloudflare
- actualiza el worker estable `nova-scientia-api`
- vÃ¡lida otra vez `https://nova-scientia-api.unhumanx.workers.dev/api/health`

Usalo cuando veas mensajes como:

- `Acceso en mantenimiento temporal`
- `HTML inesperado`
- errores `1016`, `530` o respuestas no JSON en `/api/health`

### 2. Vigilar continuamente

```powershell
npm run cf:api:watch
```

Este comando deja un watchdog corriendo y cada 90 segundos:

- revisa la salud del backend local
- revisa la salud de la API pública estable
- si detecta caida, HTML inesperado o error de Cloudflare, ejecuta el refresco automaticamente

Para detenerlo:

```powershell
Ctrl + C
```

### 3. Hacer que arranque solo al iniciar Windows

```powershell
npm run cf:api:startup
```

Este comando crea un acceso directo en la carpeta de inicio de Windows para lanzar automaticamente:

- `activar-vigilancia-nova.cmd`
- la vigilancia continua de DivulgarÃ­a

Asi, cuando abras sesiÃ³n en Windows, se inicia una terminal con el watchdog sin que tengas que recordar el comando.

## Recomendacion de uso diario

Abre una terminal en:

```powershell
I:\MDATOS2.0\nova-scientia-web
```

Luego corre:

```powershell
npm run cf:api:watch
```

Y deja esa terminal abierta mientras quieras mantener activa la autenticacion, registro y recuperación de contraseña en `pages.dev`.

Si solo quieres confirmar si todo sigue bien antes de hacer nada:

```powershell
npm run cf:api:status
```

Tambien puedes abrirlo con doble clic en:

- `estado-nova.cmd`

Si algo cayo y quieres reactivar una sola vez:

```powershell
npm run cf:api:reactivate
```

Tambien puedes abrirlo con doble clic en:

- `reactivar-nova.cmd`

Si quieres que la vigilancia arranque al iniciar Windows:

```powershell
npm run cf:api:startup
```

O con doble clic en:

- `instalar-vigilancia-inicio-nova.cmd`

## Logs utiles

Los logs quedan en:

- `I:\MDATOS2.0\nova-scientia-web\.cloudflare-runtime\backend-watch.log`
- `I:\MDATOS2.0\nova-scientia-web\.cloudflare-runtime\backend-local.out.log`
- `I:\MDATOS2.0\nova-scientia-web\.cloudflare-runtime\backend-local.err.log`

## Importante

Esta solucion ayuda mucho, pero no vuelve el sistema "24/7 real" por si sola.

Mientras el backend siga viviendo en tu maquina local:

- tu computadora debe estar encendida
- tu internet debe seguir activo
- el watchdog debe seguir corriendo

Si quieres que DivulgarÃ­a quede permanentemente activa sin depender de tu PC, el siguiente paso correcto es migrar el backend a un hosting fijo.
