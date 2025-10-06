#!/bin/bash
# WSL2 + X11 + Electron 启动脚本

echo "================================"
echo " WSL2 X11 Electron 启动脚本"
echo "================================"
echo ""

# 1. 设置X11环境变量
echo "步骤1: 配置X11环境变量..."
WINDOWS_IP=$(ip route show | grep default | awk '{print $3}')
export DISPLAY="$WINDOWS_IP:0"
export LIBGL_ALWAYS_INDIRECT=1
export ELECTRON_DISABLE_GPU=1
export ELECTRON_ENABLE_LOGGING=1

echo "✅ DISPLAY=$DISPLAY"
echo ""

# 2. 测试X11连接
echo "步骤2: 测试X11服务器连接..."
if xdpyinfo >/dev/null 2>&1; then
    echo "✅ X11服务器连接成功!"
    echo ""
else
    echo "❌ X11服务器连接失败!"
    echo ""
    echo "请确保:"
    echo "1. VcXsrv已安装并正在运行"
    echo "2. 启动VcXsrv时勾选了 'Disable access control'"
    echo "3. Windows防火墙已允许VcXsrv"
    echo ""
    echo "解决方法:"
    echo "1. 在Windows中搜索并启动 'XLaunch'"
    echo "2. 选择 'Multiple windows' -> 'Start no client'"
    echo "3. 勾选 'Disable access control' ✓"
    echo "4. 完成后重新运行此脚本"
    echo ""
    exit 1
fi

# 3. 停止旧进程
echo "步骤3: 停止旧的Electron进程..."
pkill -f "electron-vite" 2>/dev/null
pkill -f "electron" 2>/dev/null
sleep 2
echo "✅ 清理完成"
echo ""

# 4. 启动应用
echo "步骤4: 启动Electron应用..."
echo "开发服务器URL: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止应用"
echo "================================"
echo ""

npm run dev
