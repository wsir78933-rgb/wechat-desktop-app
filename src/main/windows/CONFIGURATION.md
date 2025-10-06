# 窗口配置摘要

## 主窗口配置 (mainWindow.ts)

### 窗口尺寸
```typescript
width: 1400          // 初始宽度
height: 900          // 初始高度
minWidth: 1000       // 最小宽度
minHeight: 600       // 最小高度
```

### 窗口位置
- 自动居中显示在主屏幕

### 窗口外观
```typescript
frame: true                    // 显示标准边框
backgroundColor: '#ffffff'     // 白色背景
autoHideMenuBar: true         // 自动隐藏菜单栏
titleBarStyle: 'default'      // 默认标题栏样式
```

### 安全配置
```typescript
webPreferences: {
  preload: path.join(__dirname, '../preload/preload.js'),
  contextIsolation: true,      // ✅ 上下文隔离
  nodeIntegration: false,      // ✅ 禁用 Node 集成
  sandbox: false,              // 允许 preload 访问 Node.js
  webSecurity: true,           // ✅ 启用 Web 安全
  allowRunningInsecureContent: false  // ✅ 禁止不安全内容
}
```

---

## 悬浮窗配置 (floatWindow.ts)

### 窗口尺寸
```typescript
width: 400           // 初始宽度
height: 600          // 初始高度
minWidth: 300        // 最小宽度
minHeight: 400       // 最小高度
maxWidth: 600        // 最大宽度
maxHeight: 800       // 最大高度
```

### 窗口位置
- 默认显示在屏幕右侧，垂直居中
- 距离右边缘 20 像素

### 窗口外观
```typescript
frame: false                   // ✅ 无边框
transparent: true              // ✅ 透明背景
alwaysOnTop: true             // ✅ 始终置顶
skipTaskbar: true             // 不在任务栏显示
hasShadow: true               // 显示阴影
backgroundColor: '#00000000'   // 完全透明背景
titleBarStyle: 'hidden'       // 隐藏标题栏
```

### 窗口行为
```typescript
resizable: true               // ✅ 可调整大小
show: false                   // 初始不显示
visualEffectState: 'active'   // 视觉效果状态
```

### 安全配置
```typescript
webPreferences: {
  preload: path.join(__dirname, '../preload/preload.js'),
  contextIsolation: true,      // ✅ 上下文隔离
  nodeIntegration: false,      // ✅ 禁用 Node 集成
  sandbox: false,              // 允许 preload 访问 Node.js
  webSecurity: true,           // ✅ 启用 Web 安全
  allowRunningInsecureContent: false  // ✅ 禁止不安全内容
}
```

---

## 窗口管理器 IPC 通道

### 主窗口控制
- `main-window:show` - 显示主窗口
- `main-window:hide` - 隐藏主窗口
- `main-window:toggle-devtools` - 切换开发者工具

### 悬浮窗控制
- `float-window:create` - 创建悬浮窗
- `float-window:show` - 显示悬浮窗
- `float-window:hide` - 隐藏悬浮窗
- `float-window:toggle` - 切换悬浮窗显示/隐藏
- `float-window:close` - 关闭悬浮窗

### 悬浮窗位置和大小
- `float-window:set-position` - 设置位置 (x, y)
- `float-window:get-position` - 获取位置
- `float-window:set-size` - 设置大小 (width, height)
- `float-window:get-size` - 获取大小
- `float-window:move-to-center` - 移动到中心
- `float-window:move-to-right` - 移动到右侧

### 悬浮窗属性
- `float-window:set-always-on-top` - 设置置顶 (boolean)
- `float-window:set-opacity` - 设置不透明度 (0.0-1.0)

### 窗口间通信
- `window:send-to-main` - 发送消息到主窗口
- `window:send-to-float` - 发送消息到悬浮窗
- `window:broadcast` - 广播到所有窗口
- `from-main-window` - 接收来自主窗口的消息
- `from-float-window` - 接收来自悬浮窗的消息

### 窗口状态
- `window:get-states` - 获取所有窗口状态

---

## 环境配置

### 开发环境
- **主窗口**：加载 `http://localhost:3000`
- **悬浮窗**：加载 `http://localhost:3000/float`
- **开发者工具**：自动打开

### 生产环境
- **主窗口**：加载 `../../renderer/index.html`
- **悬浮窗**：加载 `../../renderer/float.html`
- **开发者工具**：不自动打开

---

## 安全最佳实践清单

✅ **上下文隔离** (contextIsolation: true)
- 渲染进程和 preload 脚本运行在不同的上下文中
- 防止恶意代码访问 Electron 内部和 preload API

✅ **禁用 Node 集成** (nodeIntegration: false)
- 渲染进程无法直接使用 Node.js API
- 降低 XSS 攻击风险

✅ **Preload 脚本访问** (sandbox: false)
- 允许 preload 脚本使用 Node.js API
- 通过 contextBridge 安全地暴露 API 给渲染进程

✅ **启用 Web 安全** (webSecurity: true)
- 强制执行同源策略
- 防止跨站请求

✅ **禁止不安全内容** (allowRunningInsecureContent: false)
- 不允许加载不安全的 HTTP 内容
- 确保所有资源通过 HTTPS 加载

---

## 快速参考

### 创建和初始化
```typescript
import { windowManager } from './windows';

// 初始化所有窗口
windowManager.initializeWindows();
```

### 窗口控制
```typescript
// 显示/隐藏主窗口
mainWindow.show();
mainWindow.hide();

// 显示/隐藏悬浮窗
floatWindow.show();
floatWindow.hide();
floatWindow.toggle();
```

### 消息传递
```typescript
// 发送消息到主窗口
windowManager.sendToMain('event-name', data);

// 发送消息到悬浮窗
windowManager.sendToFloat('event-name', data);

// 广播消息
windowManager.broadcast('event-name', data);
```

### 窗口状态
```typescript
// 检查窗口是否存在
mainWindow.exists();
floatWindow.exists();

// 检查窗口是否可见
floatWindow.isVisible();
```
