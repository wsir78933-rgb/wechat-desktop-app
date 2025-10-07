@echo off
chcp 65001 >nul
echo =====================================
echo 打包Windows应用程序
echo =====================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0build-windows.ps1"
pause
