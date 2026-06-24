param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$launcherPath = Join-Path $projectRoot "activar-vigilancia-nova.cmd"
$startupDir = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupDir "Nova Scientia API Watchdog.lnk"

if (-not (Test-Path $launcherPath)) {
  throw "No se encontro el lanzador esperado en $launcherPath"
}

if ((Test-Path $shortcutPath) -and -not $Force) {
  Write-Host "La vigilancia automatica ya estaba registrada en:" -ForegroundColor Yellow
  Write-Host $shortcutPath -ForegroundColor White
  Write-Host "Si quieres reinstalarla, vuelve a correr con -Force." -ForegroundColor Yellow
  exit 0
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $launcherPath
$shortcut.WorkingDirectory = $projectRoot
$shortcut.IconLocation = "$env:SystemRoot\System32\SHELL32.dll,44"
$shortcut.Description = "Inicia la vigilancia local de la API publica de Nova Scientia al entrar en Windows."
$shortcut.Save()

Write-Host "La vigilancia automatica de Nova Scientia quedo instalada en el inicio de Windows." -ForegroundColor Green
Write-Host "Acceso creado:" -ForegroundColor Cyan
Write-Host $shortcutPath -ForegroundColor White
