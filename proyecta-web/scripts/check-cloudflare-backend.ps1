param(
  [string]$BackendUrl = "http://localhost:3000",
  [string]$StableApiUrl = "https://nova-scientia-api.unhumanx.workers.dev",
  [int]$TimeoutSeconds = 12,
  [int]$Retries = 3,
  [int]$RetryDelaySeconds = 4
)

$ErrorActionPreference = "Stop"

function Test-HealthEndpoint([string]$url) {
  try {
    $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec $TimeoutSeconds -Headers @{ Accept = "application/json" }
    $contentType = [string]$response.Headers["Content-Type"]
    $body = [string]$response.Content

    if ($response.StatusCode -ne 200) {
      return [pscustomobject]@{
        Healthy = $false
        Reason = "HTTP $($response.StatusCode)"
        Body = $body
      }
    }

    if ($contentType -notmatch "application/json") {
      if ($body.TrimStart().StartsWith("<")) {
        return [pscustomobject]@{
          Healthy = $false
          Reason = "Respondio HTML inesperado"
          Body = $body
        }
      }

      return [pscustomobject]@{
        Healthy = $false
        Reason = "Content-Type inesperado: $contentType"
        Body = $body
      }
    }

    $json = $body | ConvertFrom-Json -ErrorAction Stop
    if ($json.ok -eq $true) {
      return [pscustomobject]@{
        Healthy = $true
        Reason = "ok=true"
        Body = $body
      }
    }

    return [pscustomobject]@{
      Healthy = $false
      Reason = "JSON sin ok=true"
      Body = $body
    }
  } catch {
    return [pscustomobject]@{
      Healthy = $false
      Reason = $_.Exception.Message
      Body = ""
    }
  }
}

function Get-HealthWithRetry([string]$url) {
  $lastResult = $null

  for ($attempt = 1; $attempt -le $Retries; $attempt++) {
    $lastResult = Test-HealthEndpoint -url $url
    if ($lastResult.Healthy) {
      return $lastResult
    }

    if ($attempt -lt $Retries) {
      Start-Sleep -Seconds $RetryDelaySeconds
    }
  }

  return $lastResult
}

$localHealthUrl = "$BackendUrl/api/health"
$publicHealthUrl = "$StableApiUrl/api/health"

$local = Get-HealthWithRetry -url $localHealthUrl
$public = Get-HealthWithRetry -url $publicHealthUrl

Write-Host ""
Write-Host "Nova Scientia - Estado de conectividad" -ForegroundColor Cyan
Write-Host "--------------------------------------" -ForegroundColor Cyan
Write-Host "Backend local : $localHealthUrl" -ForegroundColor DarkGray
Write-Host "API publica   : $publicHealthUrl" -ForegroundColor DarkGray
Write-Host ""

if ($local.Healthy) {
  Write-Host "Backend local : SANO ($($local.Reason))" -ForegroundColor Green
} else {
  Write-Host "Backend local : CAIDO ($($local.Reason))" -ForegroundColor Yellow
}

if ($public.Healthy) {
  Write-Host "API publica   : SANA ($($public.Reason))" -ForegroundColor Green
} else {
  Write-Host "API publica   : CAIDA ($($public.Reason))" -ForegroundColor Yellow
}

Write-Host ""

if ($local.Healthy -and $public.Healthy) {
  Write-Host "Todo esta correcto. Nova Scientia puede seguir operando normalmente." -ForegroundColor Green
  exit 0
}

Write-Host "Siguiente paso recomendado:" -ForegroundColor Cyan
Write-Host "npm run cf:api:reactivate" -ForegroundColor White
Write-Host "o deja vigilancia continua con:" -ForegroundColor Cyan
Write-Host "npm run cf:api:watch" -ForegroundColor White
exit 1
