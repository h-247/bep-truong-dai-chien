@echo off
title Bep Truong Dai Chien
cd /d "%~dp0"
node scripts\start.cjs
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Da xay ra loi khi khoi chay!
    pause
)
