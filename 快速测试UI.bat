@echo off
chcp 65001 >nul
echo ====================================
echo    PyQt5 UI组件测试
echo ====================================
echo.
echo 正在启动测试程序...
echo.

cd src\main\python
python test_ui_components.py

pause
