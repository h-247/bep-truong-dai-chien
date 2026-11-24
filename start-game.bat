@echo off
title Bep Truong Dai Chien
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch.ps1"
pause
