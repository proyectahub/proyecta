# 🚀 Subir PROYECTA a GitHub (3 pasos)

## Paso 1: Crear repo en GitHub

1. Ve a **https://github.com/new**
2. Nombre: `proyecta`
3. Descripción: `Minería RandomX descentralizada - Opciones web (A) y desktop (B1)`
4. Público
5. Click en **"Create repository"**

Verás una pantalla que dice:
```
…or push an existing repository from the command line
```

## Paso 2: En PowerShell

```powershell
cd I:\MDATOS2.0

git remote add origin https://github.com/TU_USUARIO/proyecta.git
git branch -M main
git push -u origin main
```

Reemplaza `TU_USUARIO` con tu usuario de GitHub.

## Paso 3: GitHub pedirá autenticación

**Opción A: Personal Access Token (recomendado)**
1. Ve a https://github.com/settings/tokens
2. Click en "Generate new token" → "Generate new token (classic)"
3. Name: `proyecta-push`
4. Scopes: ✅ `repo` (full control)
5. Generate
6. Copia el token (verde)
7. En PowerShell, cuando pida password, **pega el token**

**Opción B: GitHub CLI**
```powershell
gh auth login
# Sigue los pasos interactivos
```

## ¡Listo!

Cuando termines, tu repo estará en:
```
https://github.com/TU_USUARIO/proyecta
```

Y puedes actualizar los links en el código:
```
https://github.com/TU_USUARIO/proyecta/blob/main/proyecta-desktop/QUICK_START.md
```
