param(
  [int]$RetryDelaySeconds = 15
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $projectRoot 'backend'
$runtimeRoot = Join-Path $projectRoot '.cloudflare-runtime'
$backendLog = Join-Path $runtimeRoot 'mining-backend.log'
$backendErrorLog = Join-Path $runtimeRoot 'mining-backend-errors.log'
$tunnelLog = Join-Path $runtimeRoot 'mining-tunnel.log'
$envFile = Join-Path $projectRoot '.env.production.local'

New-Item -ItemType Directory -Force -Path $runtimeRoot | Out-Null

function Test-MiningBackend {
  try {
    $response = Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/mining/health' -TimeoutSec 5
    return $response.ok -eq $true
  } catch {
    return $false
  }
}

function Start-MiningBackend {
  if (Test-MiningBackend) { return }

  Start-Process -FilePath $env:ComSpec -WorkingDirectory $backendRoot -WindowStyle Hidden `
    -ArgumentList '/c', 'npm.cmd start' -RedirectStandardOutput $backendLog -RedirectStandardError $backendErrorLog | Out-Null

  $deadline = (Get-Date).AddSeconds(30)
  while ((Get-Date) -lt $deadline) {
    if (Test-MiningBackend) { return }
    Start-Sleep -Seconds 1
  }

  throw 'El backend local no respondió en http://127.0.0.1:3000/api/mining/health.'
}

function Publish-TunnelUrl([string]$publicUrl) {
  $publicUrl = $publicUrl.TrimEnd('/')
  @(
    "VITE_API_URL=$publicUrl"
    "VITE_MINING_API_URL=$publicUrl/api/mining"
    "VITE_MINING_WS_URL=$($publicUrl -replace '^https:', 'wss:')/ws/mining"
    'VITE_ALLOW_DEMO_FALLBACK=false'
  ) | Set-Content -Path $envFile -Encoding ascii

  Push-Location $projectRoot
  try {
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw "El build terminó con código $LASTEXITCODE." }

    & npx.cmd wrangler pages deploy dist --project-name proyecta --branch main
    if ($LASTEXITCODE -ne 0) { throw "El deploy de Pages terminó con código $LASTEXITCODE." }
  } finally {
    Pop-Location
  }
}

while ($true) {
  try {
    Start-MiningBackend
    Remove-Item -LiteralPath $tunnelLog -Force -ErrorAction SilentlyContinue

    $tunnel = Start-Process -FilePath 'cloudflared.exe' -WindowStyle Hidden -PassThru `
      -ArgumentList 'tunnel', '--url', 'http://127.0.0.1:3000', '--no-autoupdate', '--logfile', $tunnelLog

    $deadline = (Get-Date).AddSeconds(45)
    $publicUrl = $null
    while ((Get-Date) -lt $deadline -and -not $publicUrl) {
      Start-Sleep -Milliseconds 750
      if (Test-Path $tunnelLog) {
        $match = [regex]::Match((Get-Content -LiteralPath $tunnelLog -Raw), 'https://[a-z0-9-]+\.trycloudflare\.com')
        if ($match.Success) { $publicUrl = $match.Value }
      }
      if ($tunnel.HasExited) { throw 'Cloudflare Tunnel se cerró antes de entregar una URL.' }
    }

    if (-not $publicUrl) {
      Stop-Process -Id $tunnel.Id -Force -ErrorAction SilentlyContinue
      throw 'No se obtuvo una URL temporal de Cloudflare Tunnel.'
    }

    Publish-TunnelUrl $publicUrl
    Wait-Process -Id $tunnel.Id
  } catch {
    Add-Content -Path (Join-Path $runtimeRoot 'mining-bridge-errors.log') -Value "$(Get-Date -Format o) $($_.Exception.Message)"
    Start-Sleep -Seconds $RetryDelaySeconds
  }
}
