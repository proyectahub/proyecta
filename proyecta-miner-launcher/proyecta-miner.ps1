# ============================================================
#  PROYECTA - Minero de Alto Rendimiento
#  Descarga xmrig oficial (una vez) y mina para el proyecto.
#  RandomX nativo: 100-1000x mas rapido que la mineria web.
# ============================================================

$ErrorActionPreference = "Stop"

# --- Configuracion del proyecto (editable) ---
$Wallet   = "42gfB3ayxZV2VNH8KAsUMU5fcXUqd83BGJneR37KqJaBQuzYJ8w5d3aV5DBkFH2oWo9YzJLcjhv2d5dR4V2C2xFrUGKiePh"
$Pool     = "pool.supportxmr.com:3333"
$Password = "proyecta"
$WorkerId = "proyecta-desktop"

# --- Rutas ---
$Root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$BinDir  = Join-Path $Root "xmrig"
$Exe     = Join-Path $BinDir "xmrig.exe"

function Write-Banner {
    Write-Host ""
    Write-Host "  =========================================================" -ForegroundColor Magenta
    Write-Host "    PROYECTA - Mineria de Alto Rendimiento (xmrig nativo)"   -ForegroundColor White
    Write-Host "  =========================================================" -ForegroundColor Magenta
    Write-Host "    Pool:   $Pool"      -ForegroundColor Gray
    Write-Host "    Wallet: $($Wallet.Substring(0,16))...(proyecto)" -ForegroundColor Gray
    Write-Host "  ---------------------------------------------------------" -ForegroundColor Magenta
    Write-Host ""
}

function Get-Xmrig {
    if (Test-Path $Exe) {
        Write-Host "  [OK] xmrig ya esta instalado." -ForegroundColor Green
        return
    }

    Write-Host "  [1/3] Buscando la ultima version oficial de xmrig..." -ForegroundColor Cyan

    $headers = @{ "User-Agent" = "proyecta-miner" }
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/xmrig/xmrig/releases/latest" -Headers $headers

    # Preferir build MSVC para Windows (mas rapido). Fallback a gcc.
    $asset = $release.assets | Where-Object { $_.name -like "*windows-x64.zip" } | Select-Object -First 1
    if (-not $asset) {
        $asset = $release.assets | Where-Object { $_.name -like "*windows-gcc-x64.zip" } | Select-Object -First 1
    }
    if (-not $asset) {
        throw "No se encontro un binario de Windows en la ultima release de xmrig."
    }

    $zipPath = Join-Path $Root $asset.name
    Write-Host "  [2/3] Descargando $($asset.name) (~3 MB)..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath -Headers $headers

    Write-Host "  [3/3] Extrayendo..." -ForegroundColor Cyan
    $tmp = Join-Path $Root "_xmrig_tmp"
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
    Expand-Archive -Path $zipPath -DestinationPath $tmp -Force

    # El zip extrae a una subcarpeta xmrig-X.X.X; mover su contenido a .\xmrig
    if (Test-Path $BinDir) { Remove-Item $BinDir -Recurse -Force }
    New-Item -ItemType Directory -Path $BinDir | Out-Null
    $inner = Get-ChildItem $tmp -Directory | Select-Object -First 1
    Copy-Item (Join-Path $inner.FullName "*") $BinDir -Recurse -Force

    Remove-Item $zipPath -Force
    Remove-Item $tmp -Recurse -Force

    Write-Host "  [OK] xmrig instalado en .\xmrig" -ForegroundColor Green
}

# ---------------- Main ----------------
Write-Banner

try {
    Get-Xmrig
} catch {
    Write-Host ""
    Write-Host "  [ERROR] No se pudo descargar xmrig: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Descargalo manualmente de https://github.com/xmrig/xmrig/releases" -ForegroundColor Yellow
    Write-Host "  y coloca xmrig.exe dentro de la carpeta .\xmrig\" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "  Iniciando mineria... (Ctrl+C para detener)" -ForegroundColor Green
Write-Host "  Verifica tus stats en: https://supportxmr.com  (pega el wallet del proyecto)" -ForegroundColor Gray
Write-Host ""

# Ejecutar xmrig. --donate-level 1 = minimo. rx/0 = RandomX (Monero).
& $Exe `
    -o $Pool `
    -u $Wallet `
    -p $Password `
    --rig-id $WorkerId `
    -a rx/0 `
    -k `
    --donate-level 1
