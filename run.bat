@echo off
REM 对标账号管理软件 - 启动脚本
REM Windows批处理文件

echo ====================================
echo 对标账号管理软件 v1.0
echo ====================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Python，请先安装Python 3.8+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [信息] 正在启动应用程序...
echo.

REM 运行程序
python src\main\python\main.py

REM 如果程序异常退出，暂停以便查看错误信息
if errorlevel 1 (
    echo.
    echo [错误] 程序运行出错，请查看上方错误信息
    pause
)
