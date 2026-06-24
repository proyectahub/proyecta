# Compilar PROYECTA Mining Desktop Localmente

Debido a variaciones en entornos de compilación, te recomendamos compilar la app en tu máquina.

## Pasos rápidos (Windows)

### 1. Instala Rust

```powershell
# Descarga e instala desde https://www.rust-lang.org/
# O usando winget:
winget install Rustlang.Rust.MSVC
rustup update
```

### 2. Instala dependencias de Tauri

```powershell
# En PowerShell como admin:
# Instala Visual Studio Build Tools o:
winget install Microsoft.VisualStudio.2022.BuildTools
```

### 3. Descarga este repo

```powershell
git clone https://github.com/TU_REPO/PROYECTA.git
cd proyecta-desktop
```

### 4. Instala dependencias npm

```powershell
npm install
```

### 5. Compila para desarrollo (prueba rápida)

```powershell
npm run tauri:dev
```

Esto abrirá la app en una ventana nativa. Prueba los controles.

### 6. Compila para producción (genera instalador)

```powershell
npm run tauri:build
```

Espera ~10-15 minutos. Los binarios estarán en:
```
src-tauri/target/release/bundle/msi/PROYECTA-Mining_1.0.0_x64-setup.exe
src-tauri/target/release/bundle/nsis/PROYECTA-Mining_1.0.0_x64-setup.exe
```

## Pasos rápidos (macOS)

```bash
# Instala Xcode Command Line Tools
xcode-select --install

# Instala Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Compila
npm install
npm run tauri:build
```

Binario en: `src-tauri/target/release/bundle/dmg/PROYECTA Mining_1.0.0_x64.dmg`

## Pasos rápidos (Linux)

```bash
# Ubuntu/Debian
sudo apt install libssl-dev libgtk-3-dev libayatana-appindicator3-dev

# Instala Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Compila
npm install
npm run tauri:build
```

Binario en: `src-tauri/target/release/bundle/appimage/proyecta-mining_1.0.0_amd64.AppImage`

## Empaquetar xmrig dentro

Antes de compilar, coloca el binario xmrig compilado en:
```
src-tauri/resources/xmrig          (Linux/macOS)
src-tauri/resources/xmrig.exe      (Windows)
```

O descargar un binario precompilado de: https://github.com/xmrig/xmrig/releases

## Troubleshooting

**Error: "WebView2 not installed"** (Windows)
```powershell
Invoke-WebRequest https://go.microsoft.com/fwlink/p/?LinkId=2124703 -OutFile MicrosoftEdgeWebview2Setup.exe
.\MicrosoftEdgeWebview2Setup.exe
```

**Error: "could not find `Cargo.toml`"**
```bash
cd src-tauri && cargo build --release && cd ..
```

**Error: "tauri-cli not compatible"**
```bash
npm install -g @tauri-apps/cli@1
cargo clean
npm run tauri:build
```
