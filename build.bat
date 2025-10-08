@echo off
chcp 65001 >nul
echo ========================================
echo    对标账号管理软件 - 打包工具
echo ========================================
echo.

REM 检查 PyInstaller 是否已安装
python -c "import PyInstaller" 2>nul
if errorlevel 1 (
    echo [1/4] 安装 PyInstaller...
    pip install pyinstaller
) else (
    echo [1/4] PyInstaller 已安装 ✓
)

echo.
echo [2/4] 清理旧的构建文件...
if exist "build" rmdir /s /q build
if exist "dist" rmdir /s /q dist

echo.
echo [3/4] 开始打包...
pyinstaller --clean build.spec

echo.
echo [4/4] 检查打包结果...
if exist "dist\对标账号管理软件.exe" (
    echo.
    echo ========================================
    echo    打包成功！ ✓
    echo ========================================
    echo.
    echo 可执行文件位置: dist\对标账号管理软件.exe
    echo 文件大小:
    for %%A in ("dist\对标账号管理软件.exe") do echo   %%~zA 字节
    echo.
    echo 提示：
    echo   - 可以直接运行 dist\对标账号管理软件.exe
    echo   - 首次运行会在同级目录创建 data 和 logs 文件夹
    echo.
) else (
    echo.
    echo ========================================
    echo    打包失败！ ✗
    echo ========================================
    echo.
    echo 请检查上方的错误信息
    echo.
)

pause
