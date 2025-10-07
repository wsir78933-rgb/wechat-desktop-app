@echo off
chcp 65001 >nul
echo ========================================
echo 对标账号管理软件 - 启动程序
echo ========================================
echo.

cd /d "%~dp0"

echo 正在启动应用...
python src\main\python\main.py

if %errorlevel% neq 0 (
    echo.
    echo ❌ 启动失败！
    pause
) else (
    echo.
    echo ✅ 应用已关闭
)
