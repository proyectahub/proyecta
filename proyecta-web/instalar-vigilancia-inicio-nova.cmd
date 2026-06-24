@echo off
cd /d "%~dp0"
title Nova Scientia - Instalar vigilancia al inicio
powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\install-watchdog-startup.ps1"
