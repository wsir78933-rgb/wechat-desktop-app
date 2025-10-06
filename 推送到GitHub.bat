@echo off
chcp 65001 >nul
echo =====================================
echo 推送代码到GitHub
echo =====================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0git-push.ps1"
pause
