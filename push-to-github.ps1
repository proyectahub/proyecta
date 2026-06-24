# Script para subir PROYECTA a GitHub automáticamente
# Uso: .\push-to-github.ps1 "TU_USUARIO"

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHub_Username
)

$repo_url = "https://github.com/$GitHub_Username/proyecta.git"

Write-Host "🚀 Subiendo PROYECTA a GitHub..." -ForegroundColor Cyan
Write-Host "   Repo: $repo_url" -ForegroundColor Gray

# 1. Agregar .gitignore al commit
Write-Host "📝 Agregando .gitignore..." -ForegroundColor Yellow
git add .gitignore

# 2. Hacer commit de cambios
Write-Host "💾 Haciendo commit..." -ForegroundColor Yellow
git commit --amend --no-edit 2>&1 | Out-Null

# 3. Configurar remote
Write-Host "🔗 Configurando remote..." -ForegroundColor Yellow
git remote remove origin 2>&1 | Out-Null  # Por si ya existe
git remote add origin $repo_url

# 4. Renombrar branch a main
Write-Host "📋 Renombrando branch a main..." -ForegroundColor Yellow
git branch -M main 2>&1 | Out-Null

# 5. Push
Write-Host "⬆️  Haciendo push..." -ForegroundColor Yellow
Write-Host "   Cuando pida credenciales, usa tu Personal Access Token" -ForegroundColor Gray
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ¡Éxito! Tu repo está en:" -ForegroundColor Green
    Write-Host "   $repo_url" -ForegroundColor Green
    Write-Host "" -ForegroundColor Gray
    Write-Host "Actualiza los links en el código:" -ForegroundColor Cyan
    Write-Host "   https://github.com/$GitHub_Username/proyecta/blob/main/proyecta-desktop/QUICK_START.md" -ForegroundColor Blue
} else {
    Write-Host "❌ Error. Verifica tu usuario de GitHub y acceso." -ForegroundColor Red
}
