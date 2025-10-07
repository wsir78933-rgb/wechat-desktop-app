# WSLg 使用指南

## 🎯 什么是 WSLg？

WSLg (Windows Subsystem for Linux GUI) 是 Windows 11 和 Windows 10 (Build 19044+) 内置的图形应用支持，无需额外配置 X11 服务器即可运行 Linux GUI 应用。

## ✅ 系统要求

- Windows 11 或 Windows 10 (Build 19044+)
- WSL2 已启用
- 已安装 Ubuntu 或其他 Linux 发行版

## 🚀 快速启动

### 方式一：使用启动脚本（推荐）

```bash
./start-wslg.sh
```

这个脚本会：
1. 检查 WSLg 环境配置
2. 清理旧的 Electron 进程
3. 设置必要的环境变量
4. 启动开发服务器

### 方式二：手动启动

```bash
# 确保环境变量正确
export DISPLAY=:0
export ELECTRON_DISABLE_SANDBOX=1

# 启动开发服务器
npm run dev
```

## 🔍 环境检查

### 验证 WSLg 是否可用

```bash
echo $DISPLAY
# 应该输出: :0 或 :1

echo $WAYLAND_DISPLAY
# 应该输出: wayland-0 或类似值

echo $XDG_RUNTIME_DIR
# 应该输出: /run/user/1000 或类似路径
```

### 测试 GUI 应用

```bash
# 安装测试应用
sudo apt-get update
sudo apt-get install x11-apps

# 测试 X11
xeyes
# 如果能看到眼睛应用，说明 WSLg 工作正常
```

## 🛠️ 调试

### WSLg 模式下的调试

#### 1. **主进程调试**
```bash
# 启动调试模式
npm run dev:debug

# 然后在 Chrome 中打开
chrome://inspect
# 配置: localhost:5858
```

#### 2. **渲染进程调试**
- 应用启动后自动打开 Chrome DevTools
- 或按 `Ctrl+Shift+I` 手动打开

#### 3. **查看日志**
```bash
# 主进程日志在终端输出
# 渲染进程日志在 Chrome DevTools Console
```

### 常见问题排查

#### 问题1: 应用无法启动

```bash
# 检查 DISPLAY 变量
echo $DISPLAY
# 如果为空，设置它
export DISPLAY=:0

# 检查 WSL 版本
wsl --version
# 确保使用 WSL2
```

#### 问题2: 出现沙箱错误

```bash
# Electron 在 WSL 中需要禁用沙箱
export ELECTRON_DISABLE_SANDBOX=1

# 或修改启动命令
electron . --no-sandbox
```

#### 问题3: GPU 加速问题

```bash
# 禁用 GPU 加速
export ELECTRON_DISABLE_GPU=1

# 或使用软件渲染
electron . --disable-gpu
```

## 🎨 性能优化

### 1. **使用硬件加速**

WSLg 支持 GPU 加速，但需要正确的驱动：

```bash
# 检查 GPU 是否可用
glxinfo | grep "OpenGL renderer"
```

### 2. **内存优化**

```bash
# 在 .wslconfig 中配置内存限制
# Windows 路径: %USERPROFILE%\.wslconfig

[wsl2]
memory=4GB
processors=2
```

### 3. **网络优化**

WSLg 使用 localhost 回环，性能通常很好，无需额外配置。

## 📊 与传统 X11 的比较

| 特性 | WSLg | X11 (VcXsrv/Xming) |
|------|------|-------------------|
| 配置复杂度 | ⭐ 简单 | ⭐⭐⭐ 复杂 |
| 性能 | ⭐⭐⭐ 优秀 | ⭐⭐ 良好 |
| GPU加速 | ✅ 原生支持 | ❌ 需配置 |
| 音频支持 | ✅ 内置 | ⭐⭐ 需配置 |
| 剪贴板共享 | ✅ 自动 | ⭐⭐ 需配置 |
| Windows集成 | ✅ 完美 | ❌ 有限 |

## 🔄 从 X11 迁移到 WSLg

### 1. **删除旧的 X11 配置**

```bash
# 删除 X11 启动脚本
rm start-with-x11.sh

# 删除 X11 配置文档
rm X11-配置指南.md
```

### 2. **更新环境变量**

不再需要设置：
- `DISPLAY=<Windows_IP>:0.0`
- 复杂的防火墙规则
- X11 服务器启动

只需要：
```bash
export DISPLAY=:0
```

### 3. **更新启动方式**

旧方式（X11）：
```bash
./start-with-x11.sh
```

新方式（WSLg）：
```bash
./start-wslg.sh
```

## 💡 最佳实践

### 1. **开发环境配置**

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
# WSLg 环境变量
export DISPLAY=:0
export ELECTRON_DISABLE_SANDBOX=1

# 项目快捷方式
alias wechat-dev='cd ~/项目集合/公众号桌面应用 && ./start-wslg.sh'
```

### 2. **多窗口调试**

```bash
# 终端1: 运行应用
./start-wslg.sh

# 终端2: 查看日志
tail -f ~/.config/Electron/logs/*.log

# 终端3: 运行测试
npm test
```

### 3. **性能监控**

```bash
# 监控资源使用
# 在 Windows PowerShell 中运行
wsl --status

# 在 WSL 中监控
htop
```

## 🔧 高级配置

### 自定义 Electron 启动参数

编辑 `start-wslg.sh`:

```bash
# 添加自定义参数
electron . \
  --no-sandbox \
  --disable-gpu-sandbox \
  --enable-logging \
  --v=1
```

### 配置开发工具

```bash
# 安装 Chrome 调试工具
sudo apt-get install google-chrome-stable

# 使用 Chrome 调试
chrome://inspect
```

## 📚 相关资源

- [WSLg 官方文档](https://github.com/microsoft/wslg)
- [Electron WSL 指南](https://www.electronjs.org/docs/latest/development/wsl)
- [WSL 最佳实践](https://learn.microsoft.com/zh-cn/windows/wsl/setup/environment)

## 🎉 开始使用

```bash
# 1. 确保在 WSL2 中
wsl --set-version Ubuntu 2

# 2. 进入项目目录
cd ~/项目集合/公众号桌面应用

# 3. 启动应用
./start-wslg.sh

# 4. 开始开发！
```

---

**提示**: WSLg 是 Windows 11/10 最新版本的推荐方式，无需额外配置即可获得最佳性能。
