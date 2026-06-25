# 📦 PROYECTA Logo Bundle

Logos profesionales de PROYECTA listos para usar en GUI desktop, web y aplicaciones.

## 📋 Contenido del Bundle

### Logos Cuadrados (Favicon, GUI)
- **proyecta-logo-512.svg** — Logo principal (512×512) — **RECOMENDADO PARA GUI DESKTOP**
- **proyecta-logo-256.svg** — Logo mediano (256×256) — Para barra de tareas, ventanas
- **proyecta-logo-128.svg** — Logo pequeño (128×128) — Para iconos en dialogs
- **proyecta-logo-64.svg** — Logo extra pequeño (64×64) — Para favicon, notificaciones

### Logos Horizontales
- **proyecta-lockup-dark.svg** — Logo + texto (fondo oscuro recomendado)
- **proyecta-lockup-light.svg** — Logo + texto (fondo claro recomendado)

## 🎨 Especificaciones de Diseño

### Color Scheme
- **Gradiente Púrpura-Magenta**:
  - Esquina superior izquierda: `#e040a8` (magenta)
  - Centro: `#c026d3` (púrpura)
  - Esquina inferior derecha: `#7a1e6e` (púrpura oscuro)

### Ícono
- **Símbolo**: Libro abierto (representa investigación/ciencia)
- **Color**: Blanco (`#ffffff`)
- **Estilo**: Minimalista, line-based, redondeado

### Fondo
- **Forma**: Cuadrado con esquinas muy redondeadas
- **Efecto**: Brillo sutil en esquina superior izquierda (luz natural)

## 🖥️ Uso en GUI Desktop

### Para PowerShell GUI (xmrig launcher)
```powershell
# Usar proyecta-logo-512.svg
# Convertir a Base64 o PNG para incrustar en WinForms

# Opción 1: Como archivo externo
$logo = New-Object System.Drawing.Bitmap("C:\ruta\proyecta-logo-512.svg")

# Opción 2: Convertir a PNG primero (recomendado)
# Usando ImageMagick: magick proyecta-logo-512.svg proyecta-logo-512.png
# Luego cargar en WinForms
```

### Para Electron App (si se crea)
```javascript
// En electron/main.js
const iconPath = path.join(__dirname, '../public/brand/proyecta-logo-512.svg');
const mainWindow = new BrowserWindow({
  icon: iconPath,
  width: 1200,
  height: 800
});
```

## 🌐 Uso en Web

Todos los logos SVG son totalmente responsive y se escalan sin pérdida de calidad.

```html
<!-- Logo grande (hero/landing) -->
<img src="/brand/proyecta-logo-512.svg" alt="PROYECTA" />

<!-- Logo pequeño (navbar) -->
<img src="/brand/proyecta-logo-256.svg" alt="PROYECTA" />

<!-- Favicon -->
<link rel="icon" href="/brand/proyecta-logo-64.svg" type="image/svg+xml" />
```

## 📦 Convertir a PNG

Si necesitas PNG con fondo transparente (para GUI desktop), usa ImageMagick:

```bash
# Instalar ImageMagick: https://imagemagick.org/

# Convertir a PNG (preserva transparencia)
magick -background none -density 300 proyecta-logo-512.svg proyecta-logo-512.png

# Para todos los tamaños:
for size in 512 256 128 64; do
  magick -background none -density 300 proyecta-logo-$size.svg proyecta-logo-$size.png
done
```

## 📐 Guía de Uso para GUI

### Requisitos
- **Fondo**: Cualquier color funciona (los logos tienen contraste)
- **Espacio mínimo**: 16px alrededor del logo
- **Resolución mínima**: 64×64 para iconos de barra de tareas

### Recomendaciones
- ✅ Usar **proyecta-logo-512.svg** para el icono principal de la ventana
- ✅ Usar **proyecta-logo-256.svg** para botones o menús
- ✅ Usar **proyecta-logo-64.svg** para favicon o notificaciones
- ❌ No escalar por debajo de 64×64 (calidad se degrada)
- ❌ No cambiar colores del gradiente (mantiene identidad visual)

## 📄 Ubicación

Todos los logos están en:
```
proyecta-web/public/brand/
├── proyecta-logo-512.svg
├── proyecta-logo-256.svg
├── proyecta-logo-128.svg
├── proyecta-logo-64.svg
├── proyecta-lockup-dark.svg
├── proyecta-lockup-light.svg
└── LOGOS-README.md (este archivo)
```

## 🔄 Sincronización

Los logos están sincronizados en GitHub:
```
https://github.com/proyectahub/proyecta/tree/main/proyecta-web/public/brand
```

Para usar en aplicación desktop:
1. Descarga los SVG desde GitHub o la carpeta local
2. Convierte a PNG si es necesario
3. Incrusta en GUI del .exe / .app / .deb

---

**Última actualización**: 2026-06-25
**Versión de diseño**: PROYECTA v2.0 (Branding Profesional)
