# ✨ Te Odio SAT - Monitor en Vivo Y2K ✨

Monitor en tiempo real del sitio SAT con UI Y2K, emojis felices y ponys.

## 🦄 ¿Qué es?

Una webapp Flask que chequea `https://ptscdanvisorpf.clouda.sat.gob.mx/` cada 10 segundos y muestra el estado **en vivo** en la terminal y en el navegador con:

✨ **Cara feliz** (`😊💚`) cuando está disponible
💔 **Cara triste** (`😭💔`) cuando cae
🦄 **Ponys flotantes** decorativos
🌈 **Gradiente Y2K** animado (magenta → cyan → amarillo)
📡 **Stream en vivo** con logs de todos los checks

## 🚀 Instalación Rápida

```bash
cd i:\MDATOS2.0\reports\20260513T082956Z_full_70f1959a\monitor_webapp

pip install -r requirements.txt
```

## ▶️ Ejecutar

```bash
python app.py
```

Luego abre en el navegador:
```
http://localhost:5000
```

## 🎨 Características Y2K

- **Gradiente animado**: Fondo que cambia entre magenta, cyan y amarillo
- **Glitch effect**: El título tiene efecto de distorsión retro
- **Emojis reactivos**:
  - ✅ Disponible: `😊💚`
  - ❌ No disponible: `😭💔`
- **Ponys flotantes**: Decoración con animación suave
- **Stream en vivo**: Logs de cada verificación en tiempo real
- **Colores Y2K**: Neón, sombras de texto, bordes brillantes

## 🔧 Configuración

Puedes cambiar el intervalo y la URL con variables de entorno:

```bash
# Windows PowerShell
$env:CHECK_INTERVAL="5"  # segundos
$env:TARGET_URL="https://otra-url.com/"
python app.py
```

```bash
# Linux/Mac
export CHECK_INTERVAL=5
export TARGET_URL="https://otra-url.com/"
python app.py
```

## 📂 Estructura

```
monitor_webapp/
├── app.py                    # Backend Flask + SSE
├── requirements.txt          # Dependencias
├── templates/
│   └── index.html           # UI con emojis y ponys
├── static/
│   └── style.css            # Estilos Y2K
└── README.md                # Este archivo
```

## 🎯 Cómo funciona

1. **Backend (app.py)**: 
   - Thread que chequea el sitio cada `CHECK_INTERVAL` segundos
   - Expone endpoint SSE (`/stream`) que envía eventos en tiempo real
   - Ruta `/` sirve el HTML

2. **Frontend (index.html)**:
   - Conecta a `/stream` con EventSource (Server-Sent Events)
   - Recibe eventos JSON con `{available, status_code, timestamp}`
   - Actualiza UI y logs en tiempo real

3. **Estilos (style.css)**:
   - Todo el theming Y2K
   - Animaciones CSS3 para ponys, glitch, bounce, pulse, etc.

## 💡 Tips

- Usa `CHECK_INTERVAL=5` para verificar cada 5 segundos (más frecuente)
- Usa `CHECK_INTERVAL=60` para verificar cada minuto (menos tráfico)
- Los logs en el stream muestran cada evento con timestamp
- Abre la consola del navegador (F12) para ver errores de conexión

## 🎉 Resultado

Cuando visites `http://localhost:5000` verás:

- **Título glitch**: `✨ Te Odio SAT ✨` con efecto de distorsión
- **Status card grande**: Muestra carita feliz/triste + código HTTP + hora
- **Stream en vivo**: Logs con `✅` o `❌` y timestamp
- **Ponys flotantes**: Decoración con animación suave
- **Fondo Y2K**: Gradiente animado magenta → cyan → amarillo

¡Disfruta! 🦄✨
