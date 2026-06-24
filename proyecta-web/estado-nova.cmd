@echo off
cd /d "%~dp0"
title Nova Scientia - Estado API publica
powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\check-cloudflare-backend.ps1"
