$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $projectRoot '.cloudflare-runtime'
$tunnelLog = Join-Path $runtimeRoot 'mining-tunnel.log'

function Test-Endpoint([string]$url) {
  try {
    $response = Invoke-RestMethod -Uri $url -TimeoutSec 12
    return $response.ok -eq $true
  } catch {
    return $false
  }
}

$task = schtasks.exe /Query /TN 'PROYECTA Free Mining Bridge' /FO LIST 2>$null
$taskRunning = $task -match 'Estado:\s+En ejecuci.n'
$localHealthy = Test-Endpoint 'http://127.0.0.1:3000/api/mining/health'
$tunnelUrl = $null

if (Test-Path $tunnelLog) {
  $match = [regex]::Match((Get-Content -LiteralPath $tunnelLog -Raw), 'https://[a-z0-9-]+\.trycloudflare\.com')
  if ($match.Success) { $tunnelUrl = $match.Value }
}

$publicHealthy = $false
if ($tunnelUrl) {
  $publicHealthy = Test-Endpoint "$tunnelUrl/api/mining/health"
}

[pscustomobject]@{
  TareaProgramada = if ($taskRunning) { 'ACTIVA' } else { 'NO ACTIVA' }
  BackendLocal = if ($localHealthy) { 'OK' } else { 'FALLA' }
  Tunnel = if ($tunnelUrl) { $tunnelUrl } else { 'NO DETECTADO' }
  PuentePublico = if ($publicHealthy) { 'OK' } else { 'FALLA' }
  Resultado = if ($taskRunning -and $localHealthy -and $publicHealthy) { 'LISTO: el puente acepta conexiones web.' } else { 'REPARACION: ejecuta schtasks /Run /TN "PROYECTA Free Mining Bridge".' }
} | Format-List
