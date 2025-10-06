# 窗口管理模块

窗口管理模块负责创建和管理应用中的所有窗口，包括主窗口和悬浮窗。

## 文件结构

```
windows/
├── index.ts           # 统一导出文件
├── types.ts           # TypeScript 类型定义
├── mainWindow.ts      # 主窗口配置和管理
├── floatWindow.ts     # 悬浮窗配置和管理
├── windowManager.ts   # 窗口管理器（统一管理和通信）
└── README.md          # 本文档
```

## 主要功能

### 1. 主窗口 (MainWindow)

**特性：**
- 尺寸：1400x900 像素
- 可调整大小（最小：1000x600）
- 居中显示
- 标准窗口边框
- 上下文隔离和安全配置

**配置：**
```typescript
{
  width: 1400,
  height: 900,
  minWidth: 1000,
  minHeight: 600,
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: false,
}
```

### 2. 悬浮窗 (FloatWindow)

**特性：**
- 尺寸：400x600 像素
- 置顶显示
- 无边框
- 透明背景
- 可拖拽
- 可调整大小（300-600宽，400-800高）

**配置：**
```typescript
{
  width: 400,
  height: 600,
  frame: false,          // 无边框
  transparent: true,     // 透明背景
  alwaysOnTop: true,     // 始终置顶
  skipTaskbar: true,     // 不在任务栏显示
}
```

### 3. 窗口管理器 (WindowManager)

统一管理所有窗口，处理窗口间通信。

## 使用示例

### 在主进程中使用

```typescript
// main.ts 或 index.ts
import { app } from 'electron';
import { windowManager } from './windows';

app.whenReady().then(() => {
  // 初始化所有窗口
  windowManager.initializeWindows();
});

// 应用退出时关闭所有窗口
app.on('window-all-closed', () => {
  windowManager.closeAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

### 窗口间通信

**从主窗口发送消息到悬浮窗：**
```typescript
// 在主进程中
windowManager.sendToFloat('custom-event', { message: 'Hello Float!' });

// 在悬浮窗渲染进程中监听
window.electronAPI.on('from-main-window', (data) => {
  console.log('收到主窗口消息:', data);
});
```

**从悬浮窗发送消息到主窗口：**
```typescript
// 在主进程中
windowManager.sendToMain('custom-event', { message: 'Hello Main!' });

// 在主窗口渲染进程中监听
window.electronAPI.on('from-float-window', (data) => {
  console.log('收到悬浮窗消息:', data);
});
```

**广播消息到所有窗口：**
```typescript
// 在主进程中
windowManager.broadcast('global-event', { message: 'Hello All!' });
```

### 在渲染进程中使用

渲染进程通过 preload 脚本暴露的 API 与窗口管理器通信：

```typescript
// 控制主窗口
await window.electronAPI.mainWindow.show();
await window.electronAPI.mainWindow.hide();
await window.electronAPI.mainWindow.toggleDevTools();

// 控制悬浮窗
await window.electronAPI.floatWindow.create();
await window.electronAPI.floatWindow.show();
await window.electronAPI.floatWindow.hide();
await window.electronAPI.floatWindow.toggle();
await window.electronAPI.floatWindow.close();

// 设置悬浮窗位置
await window.electronAPI.floatWindow.setPosition(100, 100);
const position = await window.electronAPI.floatWindow.getPosition();

// 设置悬浮窗大小
await window.electronAPI.floatWindow.setSize(500, 700);
const size = await window.electronAPI.floatWindow.getSize();

// 移动悬浮窗
await window.electronAPI.floatWindow.moveToCenter();
await window.electronAPI.floatWindow.moveToRight();

// 设置悬浮窗属性
await window.electronAPI.floatWindow.setAlwaysOnTop(true);
await window.electronAPI.floatWindow.setOpacity(0.9);

// 获取所有窗口状态
const states = await window.electronAPI.window.getStates();
console.log('主窗口存在:', states.main.exists);
console.log('悬浮窗可见:', states.float.visible);
```

## IPC 通道定义

所有 IPC 通道都在 `types.ts` 的 `IPC_CHANNELS` 常量中定义：

```typescript
import { IPC_CHANNELS } from './windows/types';

// 使用示例
ipcMain.handle(IPC_CHANNELS.FLOAT_WINDOW_SHOW, () => {
  // 处理逻辑
});
```

## 安全配置

所有窗口都遵循 Electron 安全最佳实践：

- ✅ `contextIsolation: true` - 启用上下文隔离
- ✅ `nodeIntegration: false` - 禁用 Node.js 集成
- ✅ `sandbox: false` - 允许 preload 脚本访问 Node.js API
- ✅ `webSecurity: true` - 启用 Web 安全
- ✅ `allowRunningInsecureContent: false` - 禁止不安全内容

## 开发环境

- **开发环境**：加载 `http://localhost:3000`
- **生产环境**：加载打包后的 HTML 文件

## 注意事项

1. **悬浮窗按需创建**：悬浮窗默认不会在应用启动时创建，需要主动调用 `create()` 方法
2. **窗口生命周期**：确保在适当的时候关闭窗口，避免内存泄漏
3. **消息传递**：使用 windowManager 进行窗口间通信，避免直接操作窗口实例
4. **类型安全**：使用 TypeScript 类型定义确保类型安全

## 扩展功能

如需添加更多窗口类型（如设置窗口、关于窗口等），可以：

1. 创建新的窗口类（参考 `mainWindow.ts` 或 `floatWindow.ts`）
2. 在 `windowManager.ts` 中添加相应的管理方法
3. 在 `types.ts` 中添加新的 IPC 通道定义
4. 在 `index.ts` 中导出新的窗口类
