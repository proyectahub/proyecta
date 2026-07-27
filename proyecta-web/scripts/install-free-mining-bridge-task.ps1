$ErrorActionPreference = 'Stop'
$taskName = 'PROYECTA Free Mining Bridge'
$scriptPath = Join-Path $PSScriptRoot 'start-free-mining-bridge.ps1'
$command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""

schtasks.exe /Create /TN $taskName /SC ONLOGON /RL HIGHEST /TR $command /F | Out-Host
Write-Host "Tarea instalada: $taskName" -ForegroundColor Green
Write-Host 'Se iniciará automáticamente al entrar a Windows.' -ForegroundColor Green
