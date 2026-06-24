# PROYECTA: Opciones de Minería Explicadas

**PROYECTA** ofrece **dos formas reales de minar** RandomX y donar cómputo a proyectos de investigación:

| | **Opción A: Navegador** | **Opción B1: App Desktop** |
|---|---|---|
| **Cómo** | RandomX WASM en el navegador, multi-hilo | xmrig nativo compilado en app Tauri |
| **Instalación** | ❌ Cero — click en "Comenzar a minar" | ✅ Una sola vez (~50 MB) |
| **Velocidad** | ~20–60 H/s (participación simbólica) | ~2.000–10.000 H/s (producción real) |
| **100× más rápido** | No (es lento) | ✅ Sí, vs navegador |
| **Sigue minando si cierro navegador** | ❌ No | ✅ Sí |
| **Verificable en** | SupportXMR + xmrchain.net | SupportXMR + xmrchain.net |
| **Target de usuario** | Participación masiva sin fricción | Minería seria / donantes comprometidos |

---

## 📂 Estructura del Repositorio

```
MDATOS2.0/
├── proyecta-web/                # Aplicación web (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── MiningOptionsModal.tsx      # Selector A vs B1
│   │   │   ├── ProjectMiningWidget.tsx    # Interfaz de minería
│   │   │   └── RandomXSelfTest.tsx        # Auto-prueba local
│   │   ├── hooks/
│   │   │   └── useRandomXMining.ts        # Lógica minería navegador (A)
│   │   └── workers/
│   │       └── randomx.worker.ts          # Web Worker con RandomX WASM
│   ├── server.js                          # Proxy Stratum WebSocket
│   ├── deploy/                            # Despliegue del proxy a VPS
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   ├── Caddyfile
│   │   └── README.md
│   └── .env                               # Variables de entorno
│
├── proyecta-desktop/                      # App desktop Tauri (Opción B1)
│   ├── src/
│   │   └── App.tsx                        # Interfaz de control minería
│   ├── src-tauri/
│   │   ├── src/
│   │   │   └── main.rs                    # Orquestación de xmrig
│   │   ├── Cargo.toml                     # Dependencias Rust
│   │   └── tauri.conf.json                # Config de la app
│   ├── package.json                       # Dependencias npm
│   ├── vite.config.ts                     # Config Vite
│   └── BUILD_AND_RELEASE.md               # Guía de compilación
│
└── MINING_OPTIONS.md                      # Este archivo
```

---

## 🌐 Opción A: Minería en Navegador

### Cómo funciona

1. **Usuario abre PROYECTA → Proyecto → "Minar"**
2. Se presenta un modal: "¿Cómo quieres minar?"
3. Elige **"Opción A: Navegador"**
4. Click en **"Comenzar a minar"**
5. Un Web Worker corre RandomX (WASM) con todos los núcleos disponibles
6. Hashes se envían al **proxy Stratum** (`npm run server`)
7. El proxy reenvía a **SupportXMR** real
8. XMR va a la dirección del proyecto
9. Verificable en `supportxmr.com/api/miner/{wallet}/stats`

### Componentes clave

| Archivo | Propósito |
|---|---|
| `MiningOptionsModal.tsx` | Presenta las dos opciones |
| `ProjectMiningWidget.tsx` | Interfaz de minería (A o B1) |
| `useRandomXMining.ts` | Hook que orquesta WebSocket + Workers |
| `randomx.worker.ts` | Web Worker con RandomX WASM real |
| `server.js` | Proxy TCP Stratum ↔ WebSocket |

### Requisitos

- ✅ Navegador moderno (Chrome, Firefox, Edge, Safari)
- ✅ `npm run server` corriendo (proxy en puerto 3001)
- ✅ Dirección Monero válida en el proyecto

### Limitaciones

- ~20–60 H/s (100–200× más lento que xmrig nativo)
- Se detiene si cierras el navegador
- Modo light RandomX (256 MB vs 2 GB fast mode)
- Sin instrucciones AES-NI nativamente

### Para probar sin pool

En cada proyecto hay un botón **"Probar hashing RandomX real (local)"**:
- No requiere conexión al pool
- Verifica el vector oficial de Monero
- Mide tu hashrate real en navegador
- Demuestra que el PoW es auténtico

---

## 🖥️ Opción B1: App Desktop Profesional

### Cómo funciona

1. **Usuario abre PROYECTA → Proyecto → "Minar"**
2. Se presenta el modal: "¿Cómo quieres minar?"
3. Elige **"Opción B1: App profesional"**
4. Se muestran **links de descarga** para Windows/macOS/Linux
5. Descarga el instalador (~50 MB)
6. Instala la app (wizard estándar)
7. Abre PROYECTA Mining
8. La **dirección del proyecto se carga automáticamente**
9. Click en **"Comenzar minería"**
10. **xmrig se ejecuta en background** (nativo, compilado en C++)
11. **2.000–10.000 H/s reales**
12. XMR va a la dirección del proyecto
13. Sigue minando aunque cierre la app
14. Verificable en `supportxmr.com` y `xmrchain.net`

### Componentes clave

| Archivo | Propósito |
|---|---|
| `proyecta-desktop/src/App.tsx` | UI de control de minería |
| `proyecta-desktop/src-tauri/src/main.rs` | Orquestación de xmrig |
| `proyecta-desktop/BUILD_AND_RELEASE.md` | Guía de compilación y distribución |
| (empaquetado) `xmrig` | Binario real de SupportXMR |

### Requisitos

- ✅ Windows 10+ / macOS 10.13+ / Linux x86_64
- ✅ CPU con AES-NI (casi todos desde 2011)
- ✅ ~50 MB de espacio en disco

### Ventajas

- **100–200× más rápido** (~2.000–10.000 H/s vs 20–60 H/s)
- **Sigue minando sin navegador**
- **Optimizado a nivel nativo** (instrucciones AES-NI, AVX2)
- **Interfaz gráfica** integrada
- **Actualizaciones automáticas** (opcional)

---

## 🔄 Flujo del Usuario: De la Web a Elegir

### Desde `ProjectDetailsExperience.tsx`

```tsx
import { ProjectMiningWidget } from '../components/ProjectMiningWidget'

// En el componente:
<ProjectMiningWidget 
  projectMoneroAddress={project.fundraisingAddress}
  projectTitle={project.title}
/>
```

### En `ProjectMiningWidget.tsx`

```tsx
const [miningMode, setMiningMode] = useState<'browser' | 'app' | null>(null)
const [showOptionsModal, setShowOptionsModal] = useState(true)

// Primero muestra modal:
<MiningOptionsModal
  isOpen={showOptionsModal && !miningMode}
  onSelectOption={handleSelectOption}  // A o B1
/>

// Después, según la elección:
{miningMode === 'browser' ? renderBrowserMode() : renderAppMode()}
```

### `MiningOptionsModal.tsx`

- Presenta **ambas opciones** lado a lado
- Tabla comparativa clara
- Botón "Descargar app" si elige B1
- Links a GitHub Releases (o tu servidor)

---

## 📦 Compilación y Despliegue

### Opción A: Despliegue

**Frontend (React):**
```bash
cd proyecta-web
npm run build
# Alojar en cualquier servidor web (Vercel, GitHub Pages, tu servidor)
```

**Proxy Stratum (Node.js):**

Opción 1 — **VPS con Docker + Caddy**:
```bash
export PROXY_DOMAIN=mineria.tudominio.com
docker compose -f deploy/docker-compose.yml up -d --build
```

Opción 2 — **VPS con systemd**:
```bash
sudo cp server.js /opt/proyecta-proxy/
sudo cp deploy/package.json /opt/proyecta-proxy/
sudo systemctl enable --now proyecta-proxy
```

Ver [deploy/README.md](proyecta-web/deploy/README.md) para detalles.

### Opción B1: Compilación y Distribución

1. **Compilar xmrig:**
   ```bash
   git clone https://github.com/xmrig/xmrig.git
   cd xmrig && mkdir build && cd build
   cmake .. && make -j$(nproc)
   ```

2. **Compilar app Tauri:**
   ```bash
   cd proyecta-desktop
   npm install
   npm run tauri:build
   ```

3. **Distribuir binarios:**
   - GitHub Releases (recomendado)
   - Servidor web propio
   - Microsoft AppStore / Mac AppStore (opcional)

Ver [proyecta-desktop/BUILD_AND_RELEASE.md](proyecta-desktop/BUILD_AND_RELEASE.md) para detalles.

---

## 🔗 Integración

### En la web (PROYECTA)

Cuando despliegues la app B1, actualiza los links en `ProjectMiningWidget.tsx`:

```tsx
const DOWNLOAD_URLS = {
  windows: 'https://github.com/PROYECTA/proyecta-desktop/releases/latest/download/PROYECTA-Mining-x64-setup.exe',
  macos: 'https://github.com/PROYECTA/proyecta-desktop/releases/latest/download/PROYECTA-Mining.dmg',
  linux: 'https://github.com/PROYECTA/proyecta-desktop/releases/latest',
}
```

### Config. de dirección

En `src-tauri/src/main.rs`, la dirección Monero se pasa desde la web:

```rust
#[tauri::command]
fn start_mining(wallet: String, threads: u32) -> Result<String, String> {
    // xmrig se lanza con esta dirección
    Command::new("xmrig")
        .arg("-u").arg(wallet)
        .arg("-o").arg("pool.supportxmr.com:3333")
        .spawn()?;
    Ok("Minería iniciada".to_string())
}
```

---

## ✅ Checklist de Despliegue

### Antes de lanzar

- [ ] **Opción A** compilada y testeada (`npm run build`)
- [ ] **Proxy Stratum** testeado en un VPS (no bloqueado Stratum)
- [ ] **Opción B1** compilada para Windows/macOS/Linux
- [ ] Binarios B1 alojados en GitHub Releases o servidor web
- [ ] Links de descarga B1 actualizados en `ProjectMiningWidget.tsx`
- [ ] Modal de opciones testeado en el navegador
- [ ] Direcciones Monero de proyectos válidas
- [ ] Pool configurado en `server.js` (SupportXMR: pool.supportxmr.com:3333)

### Después de lanzar

- [ ] Usuarios pueden elegir A o B1
- [ ] A: navegan a proyecto → "Minar" → "Navegador" → hashes en tiempo real
- [ ] B1: descargan app → minería nativa en background
- [ ] Ambas verificables en `supportxmr.com/api/miner/{wallet}/stats`
- [ ] Monitor de shares en tiempo real en la web

---

## 🤝 Para el usuario: Explicación clara

**En PROYECTA, cuando abre "Minar":**

> Eres parte de la minería descentralizada de Monero. Tienes dos opciones:
>
> **Opción A** — Donar cómputo del navegador (fácil, sin instalar)
> - Solo click en un botón
> - Funciona en cualquier navegador
> - Hashrate: ~20–60 H/s (participación simbólica)
> - Ideal si quieres probar sin comprometerte
>
> **Opción B** — Descargar app profesional (más potente)
> - Instalador ligero (~50 MB)
> - Minería real en background
> - Hashrate: ~2.000–10.000 H/s (100× más rápido)
> - Ideal si donas cómputo en serio
>
> **Ambas son minería real.** XMR va directo a la dirección del proyecto.
> Verifica en supportxmr.com que estamos minando de verdad.

---

## 📊 Comparación Final

**¿Cuál elegir?**

- **Opción A**: Quieres que muchas personas puedan participar sin fricción
- **Opción B1**: Quieres maximizar la recaudación real de XMR

**La respuesta honesta**: **Ambas juntas**. A atrae participación masiva; B1 genera volumen real. Son complementarias.
