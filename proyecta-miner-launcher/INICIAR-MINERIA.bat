@echo off
REM ============================================================
REM   PROYECTA - Minero de Alto Rendimiento (xmrig nativo)
REM   Doble clic para empezar a minar para la ciencia.
REM ============================================================
title PROYECTA Mining - Alto Rendimiento
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0proyecta-miner.ps1"
pause
