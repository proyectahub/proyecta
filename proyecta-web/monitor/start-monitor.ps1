$ErrorActionPreference = "Stop"

$monitorDir = "I:\MDATOS2.0\nova-scientia-web\monitor"
$bridgeScript = Join-Path $monitorDir "monitor-bridge.mjs"
$url = "http://127.0.0.1:8099/nova-monitor-local.html"

Set-Location $monitorDir

function Test-BridgeOnline {
  try {
    $ping = Invoke-RestMethod -Uri "http://127.0.0.1:8099/api/bridge/ping" -TimeoutSec 2
    return [bool]$ping.ok
  } catch {
    return $false
  }
}

function Wait-BridgeOnline([int]$Attempts = 8, [int]$DelayMs = 700) {
  for ($i = 0; $i -lt $Attempts; $i++) {
    if (Test-BridgeOnline) {
      return $true
    }
    Start-Sleep -Milliseconds $DelayMs
  }
  return $false
}

function Get-BridgeProcess {
  Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Where-Object { $_.CommandLine -like "*monitor-bridge.mjs*" } |
    Select-Object -First 1
}

if (-not (Test-BridgeOnline)) {
  $listener = Get-NetTCPConnection -LocalPort 8099 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($listener) {
    $listenerProc = Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue
    if ($listenerProc -and $listenerProc.ProcessName -in @("python", "node", "powershell", "pwsh")) {
      Write-Host "Puerto 8099 ocupado por $($listenerProc.ProcessName) (PID $($listenerProc.Id)). Liberando..." -ForegroundColor Yellow
      Stop-Process -Id $listenerProc.Id -Force -ErrorAction SilentlyContinue
      Start-Sleep -Milliseconds 700
    }
  }
}

$existingBridge = Get-BridgeProcess
if (-not $existingBridge -or -not (Test-BridgeOnline)) {
  Write-Host "Iniciando monitor-bridge en 127.0.0.1:8099..." -ForegroundColor Cyan
  Start-Process -FilePath "node.exe" `
    -ArgumentList @($bridgeScript) `
    -WorkingDirectory $monitorDir `
    -WindowStyle Hidden | Out-Null

  if (-not (Wait-BridgeOnline)) {
    throw "No se pudo iniciar monitor-bridge en 127.0.0.1:8099."
  }
} else {
  Write-Host "monitor-bridge ya estaba activo (PID $($existingBridge.ProcessId))." -ForegroundColor Yellow
}

Write-Host "Abriendo monitor: $url" -ForegroundColor Green
Start-Process $url

Write-Host ""
Write-Host "Tip: para vigilancia y recuperacion automatica del API usa en el monitor:" -ForegroundColor DarkGray
Write-Host "- Activar vigilancia local" -ForegroundColor DarkGray
Write-Host "- Auto-reactivar si cae API" -ForegroundColor DarkGray
