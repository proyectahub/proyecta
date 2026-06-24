@echo off
cd /d "%~dp0"
title Nova Scientia - Reactivar API publica
powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\watch-cloudflare-backend.ps1" -RunOnce
