@echo off
title Tabletop Game - Lokaler Server
echo Starte lokalen Server auf http://localhost:8080 ...
echo.

cd dist

python --version >nul 2>&1
if errorlevel 1 (
    echo [Fehler] Python ist nicht installiert oder nicht im PATH.
    echo Bitte installieren Sie Python 3, um das Projekt lokal zu starten.
    pause
    exit /b
)

start http://localhost:8080
python -m http.server 8080

pause
