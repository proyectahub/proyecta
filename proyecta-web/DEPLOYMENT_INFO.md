# 🚀 Divulgaría - Información de Deployment

## Estado Actual
**Fecha de actualización**: 01 de Junio de 2026

## Dominios Disponibles

### ✅ Dominio Principal (RECOMENDADO)
- **URL**: https://divulgaria.pages.dev/
- **Proyecto Cloudflare**: `divulgaria`
- **Estado**: ✅ Activo y en uso
- **Última actualización**: 01 Jun 2026

### ⚠️ Dominios Alternativos (Deprecados)
- **https://divulgaria.pages.dev** - Proyecto antiguo, no mantener
- **https://divulgaria.pages.dev** - Proyecto con bundle viejo, NO USAR

## Configuración Actual

### API Backend
- **URL estable**: https://nova-scientia-api.unhumanx.workers.dev
- **Health check**: https://nova-scientia-api.unhumanx.workers.dev/api/health
- **Estado**: ✅ Funcionando

### Archivo de Configuración Frontend
- **Ubicación**: `.env.production`
- **Valor VITE_API_URL**: `https://nova-scientia-api.unhumanx.workers.dev`
- **Timestamp**: 31 May 2026

## Cambios Recientes (01 Jun 2026)

### Archivos de Configuración Añadidos
1. **public/_headers** - Headers de caché y seguridad para Cloudflare Pages
   - No caché para index.html
   - Max caché (31536000s) para assets versionados
   - Headers de seguridad (X-Content-Type-Options, X-Frame-Options, etc.)

2. **public/_redirects** - Configuración de rutas para SPA
   - Todas las rutas redirigen a index.html para React Router
   - Excepciones para /assets y /brand

### Código Modificado
1. **src/lib/api.ts**
   - Mejorado `checkApiHealth()` con timeout de 8s (ajustado para redes móviles)
   - Mejorado `normalizeApiError()` con mensajes específicos de error
   - Añadido manejo robusto de CORS y errores de red

2. **src/pages/LoginExperience.tsx**
   - Mejorado mensaje de estado del API
   - Mensaje más claro y útil para usuarios en móvil

3. **src/context/AuthContext.tsx**
   - Añadido logging detallado de errores para debugging
   - Mejor manejo de fallback en demo mode
   - Mensajes de error más específicos

## Problema Resuelto: Compatibilidad Móvil

### Síntomas
- En escritorio: login funcionaba correctamente
- En móvil: aparecía "Acceso en mantenimiento temporal"

### Causa Raíz
- Problema de timeout en redes móviles lentas
- Caché del navegador sirviendo versiones antiguas
- Falta de headers de control de caché

### Soluciones Aplicadas
1. **Aumento de timeout** en `checkApiHealth()` de 5s a 8s
2. **Headers de no-caché** para index.html en Cloudflare
3. **Mejora de mensajes de error** para ser más específicos
4. **Logging detallado** para debugging en producción

## Cómo Hacer Deploy

### Deploy a Producción (divulgaria)
```bash
npm run cf:pages:deploy
```

### Verificar Deploy
```bash
npm run cf:pages:deploy
# Buscar el deployment URL en la salida
# Ejemplo: https://e7b8ace2.divulgaria.pages.dev
```

### Preview (rama preview)
```bash
npm run cf:pages:preview
```

## Monitoreo

### Health Check
```bash
curl https://divulgaria.pages.dev/ -I
curl https://nova-scientia-api.unhumanx.workers.dev/api/health
```

### Verificación en Móvil
1. Abrir https://divulgaria.pages.dev/ en teléfono
2. Intentar login/registro
3. Verificar que NO aparece "mantenimiento temporal"
4. Verificar que todos los botones son accesibles

## Variables de Entorno

### .env (Desarrollo Local)
```
VITE_API_URL=http://localhost:3000
```

### .env.production (Producción)
```
VITE_API_URL=https://nova-scientia-api.unhumanx.workers.dev
```

## Próximas Acciones

- [ ] Ejecutar test completo en dispositivo móvil real
- [ ] Monitorear error logs en Cloudflare
- [ ] Considerar consolidar dominios (eliminar proyectos viejos)
- [ ] Implementar tracking de performance en móvil

## Contacto para Issues
Si experimenta problemas con el login en móvil:
1. Limpiar caché del navegador
2. Intentar en incógnito/privado
3. Verificar conexión a internet
4. Revisar browser console (F12 → Console)
