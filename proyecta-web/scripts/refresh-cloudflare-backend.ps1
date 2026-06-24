param(
  [string]$BackendUrl = "http://localhost:3000",
  [int]$TimeoutSeconds = 45,
  [string]$CloudflareAccountId = "ef69f50004aaaa9f2d814296ca2c854c"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$workerConfigPath = Join-Path $projectRoot "cloudflare\api-proxy\wrangler.toml"
$runtimeDir = Join-Path $projectRoot ".cloudflare-runtime"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = Join-Path $runtimeDir "quick-tunnel-$timestamp.log"
$stableApiUrl = "https://nova-scientia-api.unhumanx.workers.dev"

function Write-Step($message) {
  Write-Host ""
  Write-Host "==> $message" -ForegroundColor Cyan
}

function Require-Command($name) {
  $command = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $command) {
    throw "No se encontro el comando requerido: $name"
  }
  return $command
}

function Get-QuickTunnelUrl($path) {
  if (-not (Test-Path $path)) {
    return $null
  }

  $content = Get-Content -Path $path -Raw -ErrorAction SilentlyContinue
  if (-not $content) {
    return $null
  }

  $match = [regex]::Match($content, "https://[a-z0-9-]+\.trycloudflare\.com")
  if ($match.Success) {
    return $match.Value
  }

  return $null
}

Require-Command "cloudflared.exe" | Out-Null
Require-Command "npx.cmd" | Out-Null

Write-Step "Validando backend local"
$healthUrl = "$BackendUrl/api/health"
try {
  $health = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 10
  if (-not $health.ok) {
    throw "El backend respondio sin ok=true"
  }
} catch {
  throw "No fue posible alcanzar el backend local en $BackendUrl. Asegura que este activo antes de refrescar el proxy."
}

Write-Step "Preparando tunnel rapido"
New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

$existingProcesses = Get-CimInstance Win32_Process -Filter "Name = 'cloudflared.exe'" |
  Where-Object { $_.CommandLine -like "*tunnel --url $BackendUrl*" }

foreach ($process in $existingProcesses) {
  try {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
  } catch {
    Write-Host "No fue posible cerrar el proceso cloudflared $($process.ProcessId)." -ForegroundColor Yellow
  }
}

$staleLogs = Get-ChildItem -Path $runtimeDir -Filter "quick-tunnel*.log" -ErrorAction SilentlyContinue
foreach ($staleLog in $staleLogs) {
  try {
    Remove-Item -Path $staleLog.FullName -Force -ErrorAction Stop
  } catch {
    Write-Host "No fue posible limpiar el log previo $($staleLog.Name); se continuara con uno nuevo." -ForegroundColor Yellow
  }
}

$cloudflaredArgs = @(
  "tunnel",
  "--url",
  $BackendUrl,
  "--logfile",
  $logFile,
  "--no-autoupdate"
)

$process = Start-Process -FilePath "cloudflared.exe" -ArgumentList $cloudflaredArgs -PassThru -WindowStyle Hidden

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
$tunnelUrl = $null

do {
  Start-Sleep -Milliseconds 800
  $tunnelUrl = Get-QuickTunnelUrl -path $logFile
} while (-not $tunnelUrl -and (Get-Date) -lt $deadline)

if (-not $tunnelUrl) {
  try {
    Stop-Process -Id $process.Id -Force -ErrorAction Stop
  } catch {
  }
  throw "No se detecto una URL trycloudflare en el tiempo esperado. Revisa $logFile."
}

Write-Step "Actualizando origen del worker"
$config = Get-Content -Path $workerConfigPath -Raw
$updatedConfig = [regex]::Replace(
  $config,
  'BACKEND_ORIGIN\s*=\s*"[^"]+"',
  "BACKEND_ORIGIN = `"$tunnelUrl`""
)

if ($updatedConfig -eq $config) {
  throw "No se pudo actualizar BACKEND_ORIGIN en $workerConfigPath."
}

Set-Content -Path $workerConfigPath -Value $updatedConfig -NoNewline

Write-Step "Desplegando proxy estable"
Push-Location $projectRoot
try {
  if (-not $env:CLOUDFLARE_ACCOUNT_ID) {
    $env:CLOUDFLARE_ACCOUNT_ID = $CloudflareAccountId
  }
  & npx.cmd wrangler deploy --config cloudflare/api-proxy/wrangler.toml
  if ($LASTEXITCODE -ne 0) {
    throw "Wrangler termino con codigo $LASTEXITCODE."
  }
} finally {
  Pop-Location
}

Write-Step "Listo"
Write-Host "Tunnel temporal activo: $tunnelUrl" -ForegroundColor Green
Write-Host "API publica estable:  $stableApiUrl" -ForegroundColor Green
Write-Host "Proceso cloudflared:    $($process.Id)" -ForegroundColor Green
