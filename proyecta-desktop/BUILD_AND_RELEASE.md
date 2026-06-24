# Construir y liberar PROYECTA Mining Desktop (Opción B1)

Esta es la app nativa de minería RandomX con xmrig compilado. Se distribuye como:
- **Windows**: instalador `.msi`/`.nsis`
- **macOS**: `.dmg`
- **Linux**: binario/AppImage

---

## Requisitos previos

### 1. Rust y cargo

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup update
```

### 2. Tauri CLI

```bash
npm install -g @tauri-apps/cli
# O localmente:
npm install --save-dev @tauri-apps/cli
```

### 3. Dependencias del sistema

**Windows (PowerShell como admin):**
```powershell
# Instala Webview2 y build tools
Invoke-WebRequest https://go.microsoft.com/fwlink/p/?LinkId=2124703 -OutFile MicrosoftEdgeWebview2Setup.exe
.\MicrosoftEdgeWebview2Setup.exe
# Build tools: instala Visual Studio o Microsoft C++ Build Tools
```

**macOS:**
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install libssl-dev libgtk-3-dev libayatana-appindicator3-dev
```

### 4. xmrig compilado

xmrig se debe compilar **por separado** y empaquetar dentro de la app. 

```bash
# Clonar xmrig
git clone https://github.com/xmrig/xmrig.git
cd xmrig
mkdir build && cd build
cmake ..
make -j$(nproc)

# El binario estará en `build/xmrig` (Linux/macOS) o `build/Release/xmrig.exe` (Windows)
```

Luego copiar el binario a `src-tauri/resources/` o incluirlo en el build de Tauri.

---

## Estructura del proyecto

```
proyecta-desktop/
├── src/                      # Código React/Tauri frontend
│   └── App.tsx              # Interfaz de control
├── src-tauri/               # Código Rust (backend Tauri)
│   ├── src/main.rs          # Orquestación de xmrig
│   ├── Cargo.toml           # Dependencias Rust
│   └── tauri.conf.json      # Config de la app
├── package.json             # Dependencias npm
├── vite.config.ts           # Config de Vite
└── BUILD_AND_RELEASE.md     # Este archivo
```

---

## Compilar localmente (desarrollo)

```bash
cd proyecta-desktop

# Instalar dependencias
npm install

# Desarrollo con hot-reload
npm run tauri:dev
```

La app abrirá en una ventana nativa con el dev server en `http://localhost:5173`.

---

## Compilar para distribuir

### Paso 1: Empaquetar xmrig dentro de la app

Copiar el binario compilado de xmrig:

```bash
# Desde la raíz del repo
cp path/to/xmrig/build/xmrig proyecta-desktop/src-tauri/resources/
```

O, en Windows:
```powershell
Copy-Item "path\to\xmrig\build\Release\xmrig.exe" "proyecta-desktop\src-tauri\resources\"
```

### Paso 2: Build para producción

```bash
cd proyecta-desktop
npm run tauri:build
```

Tauri compilará:
- El frontend React (Vite)
- El backend Rust (Cargo)
- Empaquetará todo en un instalador

**Outputs** (según SO):

- **Windows**: `src-tauri/target/release/bundle/msi/` y `nsis/`
  - `PROYECTA-Mining_1.0.0_x64-setup.exe` (NSIS, recomendado)
  - `PROYECTA-Mining_1.0.0_x64.msi` (MSI)

- **macOS**: `src-tauri/target/release/bundle/dmg/`
  - `PROYECTA Mining_1.0.0_x64.dmg`

- **Linux**: `src-tauri/target/release/bundle/appimage/`
  - `proyecta-mining_1.0.0_amd64.AppImage`

---

## Distribuir los binarios

### Opción A: GitHub Releases (recomendado)

```bash
# Crear un release en GitHub
gh release create v1.0.0 \
  src-tauri/target/release/bundle/msi/PROYECTA-Mining_1.0.0_x64-setup.exe \
  src-tauri/target/release/bundle/dmg/PROYECTA\ Mining_1.0.0_x64.dmg \
  src-tauri/target/release/bundle/appimage/proyecta-mining_1.0.0_amd64.AppImage
```

Luego en el ProjectMiningWidget, los links de descarga apuntarán a:
```
https://github.com/PROYECTA/proyecta-desktop/releases/latest/download/PROYECTA-Mining_1.0.0_x64-setup.exe
https://github.com/PROYECTA/proyecta-desktop/releases/latest/download/PROYECTA\ Mining_1.0.0_x64.dmg
```

### Opción B: Servidor web propio

```bash
# Copiar binarios a tu servidor
scp src-tauri/target/release/bundle/msi/PROYECTA-Mining_*.exe tu-servidor:/var/www/downloads/
scp src-tauri/target/release/bundle/dmg/PROYECTA\ Mining_*.dmg tu-servidor:/var/www/downloads/
```

Luego actualizar los links en `ProjectMiningWidget.tsx`:
```tsx
href="https://tu-servidor/downloads/PROYECTA-Mining-x64-setup.exe"
```

---

## Firma de código (producción)

Para builds confiables, firma los instaladores con un certificado:

### Windows

```bash
# En tauri.conf.json, agrega:
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_THUMBPRINT",
      "signingIdentity": "YOUR_IDENTITY",
      "timestampUrl": "http://timestamp.comodoca.com"
    }
  }
}
```

### macOS

```bash
# En tauri.conf.json:
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)"
    }
  }
}
```

---

## Actualización automática (opcional)

Tauri soporta updater integrado. Para habilitarlo:

1. En `tauri.conf.json`:
   ```json
   {
     "tauri": {
       "updater": {
         "active": true,
         "endpoints": ["https://releases.example.com/latest.json"],
         "dialog": true
       }
     }
   }
   ```

2. Alojar el manifest en tu servidor:
   ```json
   {
     "version": "1.0.1",
     "notes": "Nueva versión con optimizaciones",
     "pub_date": "2024-01-15T10:00:00Z",
     "platforms": {
       "windows-x86_64": {
         "signature": "signature_here",
         "url": "https://releases.example.com/PROYECTA-Mining_1.0.1_x64-setup.exe"
       }
     }
   }
   ```

---

## Troubleshooting

### Error: "xmrig not found"
- Asegúrate de que el binario está en `src-tauri/resources/xmrig` (Linux/macOS) o `xmrig.exe` (Windows).
- En `src-tauri/src/main.rs`, actualiza la ruta si es necesario.

### Error: "WebView2 not installed" (Windows)
- Descarga e instala Microsoft Edge WebView2 Runtime:
  ```powershell
  Invoke-WebRequest https://go.microsoft.com/fwlink/p/?LinkId=2124703 -OutFile MicrosoftEdgeWebview2Setup.exe
  .\MicrosoftEdgeWebview2Setup.exe
  ```

### Error: Rust compilation fails
```bash
rustup update
cargo clean
npm run tauri:build
```

---

## Flujo de usuario (final)

1. Usuario descarga la app (Windows/macOS/Linux)
2. Instala normalmente (wizard de instalación)
3. Abre PROYECTA Mining
4. La dirección Monero del proyecto se autocarga (desde la web)
5. Ajusta threads si quiere
6. Click en "Comenzar minería"
7. xmrig se ejecuta en background, minando a SupportXMR
8. XMR fluye directo a la dirección del proyecto
9. Verificable en supportxmr.com y xmrchain.net

---

## Resumen: Opción A vs B1

| | A: Navegador | B1: App Desktop |
|---|---|---|
| Hashrate | ~20–60 H/s | ~2.000–10.000 H/s |
| Instalación | Cero | Una sola vez (~50 MB) |
| Actualización | Automática (web) | Manual o updater |
| Fricción | Mínima | Media (instalador) |
| Soporte | Amplio (todos navegadores) | Windows/macOS/Linux |

Ambas son **minería real verificable** en SupportXMR. A es simbólica; B1 es producción.
