# Compilar PROYECTA Mining Desktop — Un Comando

## ⚡ Instalación rápida (Todos los SO)

### Requisitos previos (primera vez)

**Windows:**
```powershell
winget install Rustlang.Rust.MSVC
winget install Microsoft.VisualStudio.2022.BuildTools
```

**macOS:**
```bash
xcode-select --install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install libssl-dev libgtk-3-dev libayatana-appindicator3-dev
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Compilar (Windows/macOS/Linux)

```bash
git clone https://github.com/proyectahub/proyecta.git
cd proyecta/proyecta-desktop
npm install && npm run tauri:build
```

**Eso es todo.** La app se compilará completamente en ~15 minutos.

## 📦 Dónde está el instalador

- **Windows**: `src-tauri/target/release/bundle/msi/PROYECTA-Mining_1.0.0_x64-setup.exe`
- **macOS**: `src-tauri/target/release/bundle/dmg/PROYECTA Mining_1.0.0_x64.dmg`
- **Linux**: `src-tauri/target/release/bundle/appimage/proyecta-mining_1.0.0_amd64.AppImage`

## 🧪 Probar primero (sin compilar)

```bash
npm install && npm run tauri:dev
```

Abre la app en una ventana nativa para probar antes de hacer el instalador final.

## 🔧 Troubleshooting

| Error | Solución |
|---|---|
| **"WebView2 not installed"** | Descargar desde https://developer.microsoft.com/microsoft-edge/webview2/ |
| **"could not find Cargo.toml"** | `cd src-tauri && cargo build --release && cd ..` |
| **Compilación lenta** | Normal en primera ejecución. Las posteriores son más rápidas. |

## 📝 Notas

- **Primera compilación**: ~15-30 minutos
- **Compilaciones posteriores**: ~5-10 minutos
- **RAM requerida**: Mínimo 4GB
- **Espacio disco**: ~3GB para compilar, ~200MB para instalador
