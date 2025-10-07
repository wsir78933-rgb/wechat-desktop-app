#!/bin/bash

# Electron应用WSLg启动脚本
# 使用WSL2内置的WSLg图形支持运行Electron应用

echo "🚀 使用WSLg启动Electron应用..."
echo ""

# 检查WSLg环境
echo "📊 检查WSLg环境..."
echo "DISPLAY: $DISPLAY"
echo "WAYLAND_DISPLAY: $WAYLAND_DISPLAY"
echo "XDG_RUNTIME_DIR: $XDG_RUNTIME_DIR"
echo ""

# 检查是否在WSL2中
if ! grep -qi microsoft /proc/version; then
    echo "⚠️  警告：当前不在WSL2环境中"
    echo ""
fi

# 设置环境变量
export DISPLAY=:0
export ELECTRON_DISABLE_SANDBOX=1
export ELECTRON_NO_ATTACH_CONSOLE=1
export ELECTRON_DISABLE_GPU=1
export LIBGL_ALWAYS_SOFTWARE=1

# 清理可能存在的Electron进程
echo "🧹 清理旧的Electron进程..."
pkill -f electron || true
sleep 1

# 启动开发服务器
echo ""
echo "🔧 启动Electron开发服务器..."
echo "   - 主进程调试端口: 5858"
echo "   - 渲染进程端口: 5173+"
echo "   - Chrome DevTools: 自动打开"
echo ""
echo "💡 调试提示:"
echo "   - 按 Ctrl+Shift+I 打开DevTools"
echo "   - 按 Ctrl+C 停止服务器"
echo "   - 主进程日志显示在此终端"
echo ""
echo "-----------------------------------"
echo ""

# 启动npm dev with additional Electron flags
ELECTRON_ENABLE_LOGGING=1 npm run dev -- --no-sandbox --disable-gpu-sandbox
