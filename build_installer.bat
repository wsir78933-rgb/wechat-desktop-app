@echo off
chcp 65001 >nul
echo ========================================
echo 对标账号管理软件 - 安装程序构建脚本
echo ========================================
echo.

:: 检查是否存在 dist 目录
if not exist "dist\对标账号管理软件.exe" (
    echo [1/3] 正在使用 PyInstaller 打包 exe...
    call build.bat
    if errorlevel 1 (
        echo ❌ PyInstaller 打包失败！
        pause
        exit /b 1
    )
    echo ✅ PyInstaller 打包完成
    echo.
) else (
    echo ✅ 检测到已存在的 exe 文件，跳过 PyInstaller 打包
    echo.
)

:: 检查是否安装了 Inno Setup
echo [2/3] 检查 Inno Setup...
set ISCC_PATH="%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
if not exist %ISCC_PATH% (
    set ISCC_PATH="%ProgramFiles%\Inno Setup 6\ISCC.exe"
)

if not exist %ISCC_PATH% (
    echo ❌ 未找到 Inno Setup！
    echo.
    echo 请从以下地址下载并安装 Inno Setup:
    echo https://jrsoftware.org/isdl.php
    echo.
    echo 推荐下载: innosetup-6.x.x.exe (Unicode 版本)
    echo.
    pause
    exit /b 1
)
echo ✅ 找到 Inno Setup: %ISCC_PATH%
echo.

:: 创建输出目录
if not exist "output\installer" (
    mkdir "output\installer"
)

:: 使用 Inno Setup 编译安装程序
echo [3/3] 正在使用 Inno Setup 编译安装程序...
%ISCC_PATH% installer.iss
if errorlevel 1 (
    echo ❌ Inno Setup 编译失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 安装程序构建完成！
echo ========================================
echo.
echo 输出文件位置:
dir /b "output\installer\*.exe"
echo.
echo 完整路径: %cd%\output\installer\
echo.
pause
