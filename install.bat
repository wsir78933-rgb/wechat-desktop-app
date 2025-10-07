@echo off
REM 对标账号管理软件 - 依赖安装脚本
REM Windows批处理文件

echo ====================================
echo 对标账号管理软件 - 依赖安装
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

echo [信息] 检测到Python版本:
python --version
echo.

REM 检查pip是否可用
pip --version >nul 2>&1
if errorlevel 1 (
    echo [错误] pip未安装或不可用
    pause
    exit /b 1
)

echo [信息] 正在安装依赖包...
echo.

REM 升级pip
echo [步骤1/2] 升级pip...
python -m pip install --upgrade pip

echo.
echo [步骤2/2] 安装项目依赖...

REM 安装依赖
pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo [错误] 依赖安装失败，请检查网络连接或手动安装
    echo 手动安装命令: pip install -r requirements.txt
    pause
    exit /b 1
) else (
    echo.
    echo ====================================
    echo [成功] 所有依赖安装完成！
    echo ====================================
    echo.
    echo 现在可以运行程序了:
    echo 1. 双击 run.bat 启动程序
    echo 2. 或在命令行执行: python src\main\python\main.py
    echo.
)

pause
