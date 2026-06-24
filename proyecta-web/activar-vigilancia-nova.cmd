@echo off
cd /d "%~dp0"
title Nova Scientia - Vigilancia API publica
powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\watch-cloudflare-backend.ps1"
