param(
  [string]$BackendUrl = "http://localhost:3000",
  [string]$StableApiUrl = "https://nova-scientia-api.unhumanx.workers.dev",
  [int]$CheckEverySeconds = 90,
  [int]$HealthTimeoutSeconds = 15,
  [int]$BackendStartupTimeoutSeconds = 30,
  [switch]$RunOnce,
  [switch]$NoAutoStartBackend
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$backendDir = Join-Path $projectRoot "backend"
$refreshScriptPath = Join-Path $scriptDir "refresh-cloudflare-backend.ps1"
$runtimeDir = Join-Path $projectRoot ".cloudflare-runtime"
$watchLogPath = Join-Path $runtimeDir "backend-watch.log"
$backendStdoutPath = Join-Path $runtimeDir "backend-local.out.log"
$backendStderrPath = Join-Path $runtimeDir "backend-local.err.log"

function Write-Log($message, [string]$color = "Gray") {
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $line = "[$timestamp] $message"
  Write-Host $line -ForegroundColor $color
  Add-Content -Path $watchLogPath -Value $line
}

function Require-Command($name) {
  $command = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $command) {
    throw "No se encontró el comando requerido: $name"
  }
}

function Get-HealthStatus([string]$url) {
  try {
    $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec $HealthTimeoutSeconds -Headers @{ Accept = "application/json" }
    $contentType = [string]$response.Headers["Content-Type"]
    $body = [string]$response.Content

    if ($response.StatusCode -ne 200) {
      return [pscustomobject]@{
        Healthy = $false
        Reason = "HTTP $($response.StatusCode)"
      }
    }

    if ($contentType -notmatch "application/json") {
      if ($body.TrimStart().StartsWith("<")) {
        return [pscustomobject]@{
          Healthy = $false
          Reason = "La ruta respondió HTML inesperado"
        }
      }

      return [pscustomobject]@{
        Healthy = $false
        Reason = "Content-Type inesperado: $contentType"
      }
    }

    try {
      $json = $body | ConvertFrom-Json -ErrorAction Stop
    } catch {
      return [pscustomobject]@{
        Healthy = $false
        Reason = "La respuesta no pudo interpretarse como JSON"
      }
    }

    if ($json.ok -eq $true) {
      return [pscustomobject]@{
        Healthy = $true
        Reason = "ok=true"
      }
    }

    return [pscustomobject]@{
      Healthy = $false
      Reason = "JSON sin ok=true"
    }
  } catch {
    $message = $_.Exception.Message
    if ($message -match "error code:\s*(\d+)") {
      return [pscustomobject]@{
        Healthy = $false
        Reason = "Cloudflare respondió error $($matches[1])"
      }
    }

    return [pscustomobject]@{
      Healthy = $false
      Reason = $message
    }
  }
}

function Wait-ForHealthyStatus([string]$url, [int]$Attempts = 5, [int]$DelaySeconds = 4) {
  $lastHealth = $null

  for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    $lastHealth = Get-HealthStatus -url $url
    if ($lastHealth.Healthy) {
      return $lastHealth
    }

    if ($attempt -lt $Attempts) {
      Start-Sleep -Seconds $DelaySeconds
    }
  }

  return $lastHealth
}

function Get-NodeBackendProcess() {
  Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Where-Object {
      $_.CommandLine -like "*nova-scientia-web\backend\index.js*" -or
      $_.CommandLine -like "*nova-scientia-web/backend/index.js*"
    } |
    Select-Object -First 1
}

function Ensure-LocalBackend() {
  $healthUrl = "$BackendUrl/api/health"
  $health = Get-HealthStatus -url $healthUrl

  if ($health.Healthy) {
    Write-Log "Backend local sano en $healthUrl." "Green"
    return $true
  }

  Write-Log "Backend local no responde todavía: $($health.Reason)" "Yellow"

  if ($NoAutoStartBackend) {
    Write-Log "No se intentará levantar el backend porque usaste -NoAutoStartBackend." "Yellow"
    return $false
  }

  $existingProcess = Get-NodeBackendProcess
  if ($existingProcess) {
    Write-Log "Se detectó un proceso backend existente (PID $($existingProcess.ProcessId)). Esperando a que responda..." "Yellow"
  } else {
    Write-Log "Levantando backend local desde $backendDir..." "Cyan"
    Start-Process -FilePath "npm.cmd" `
      -ArgumentList @("run", "dev") `
      -WorkingDirectory $backendDir `
      -WindowStyle Hidden `
      -RedirectStandardOutput $backendStdoutPath `
      -RedirectStandardError $backendStderrPath | Out-Null
  }

  $deadline = (Get-Date).AddSeconds($BackendStartupTimeoutSeconds)
  do {
    Start-Sleep -Seconds 2
    $health = Get-HealthStatus -url $healthUrl
  } while (-not $health.Healthy -and (Get-Date) -lt $deadline)

  if ($health.Healthy) {
    Write-Log "Backend local reactivado correctamente." "Green"
    return $true
  }

  Write-Log "El backend local sigue sin responder. Revisa $backendStdoutPath y $backendStderrPath." "Red"
  return $false
}

function Refresh-StableApi() {
  Write-Log "Refrescando el túnel y el worker estable..." "Cyan"
  & powershell.exe -ExecutionPolicy Bypass -File $refreshScriptPath -BackendUrl $BackendUrl
  if ($LASTEXITCODE -ne 0) {
    throw "El script de refresco terminó con código $LASTEXITCODE."
  }
}

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
Require-Command "powershell.exe"
Require-Command "npm.cmd"

Write-Log "Vigilancia de Nova Scientia iniciada. API estable: $StableApiUrl" "Cyan"
Write-Log "Modo: $(if ($RunOnce) { 'reactivación puntual' } else { 'monitoreo continuo cada ' + $CheckEverySeconds + ' segundos' })"

do {
  $localReady = Ensure-LocalBackend
  if (-not $localReady) {
    if ($RunOnce) {
      exit 1
    }

    Write-Log "No fue posible usar el backend local todavía. Se volverá a intentar en $CheckEverySeconds segundos." "Yellow"
    Start-Sleep -Seconds $CheckEverySeconds
    continue
  }

  $publicHealthUrl = "$StableApiUrl/api/health"
  $publicHealth = Wait-ForHealthyStatus -url $publicHealthUrl -Attempts 6 -DelaySeconds 4

  if ($publicHealth.Healthy) {
    Write-Log "La API pública está sana en $publicHealthUrl." "Green"
  } else {
    Write-Log "La API pública cayó: $($publicHealth.Reason)" "Yellow"

    try {
      Refresh-StableApi
      Start-Sleep -Seconds 4
      $publicHealth = Get-HealthStatus -url $publicHealthUrl

      if ($publicHealth.Healthy) {
        Write-Log "La API pública quedó reactivada correctamente." "Green"
      } else {
        Write-Log "La API pública sigue fallando después del refresco: $($publicHealth.Reason)" "Red"
      }
    } catch {
      Write-Log "Falló el refresco automático del backend público: $($_.Exception.Message)" "Red"
    }
  }

  if ($RunOnce) {
    break
  }

  Start-Sleep -Seconds $CheckEverySeconds
} while ($true)

Write-Log "Proceso terminado." "Cyan"
