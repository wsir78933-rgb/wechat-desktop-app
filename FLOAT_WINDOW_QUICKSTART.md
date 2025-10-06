# 悬浮窗组件快速开始指南

## 组件已完成

所有悬浮窗UI组件已开发完成，准备就绪！

---

## 文件清单

### ✅ 已创建的文件（15个）

```
📁 src/renderer/src/components/FloatWindow/
   ├── FloatLayout.tsx      (3.9KB) - 悬浮窗布局
   ├── UrlInput.tsx         (6.1KB) - URL输入
   ├── QuickTags.tsx        (5.4KB) - 标签选择
   ├── RecentArticles.tsx   (6.3KB) - 文章列表
   ├── DropZone.tsx         (3.9KB) - 拖放区域
   ├── index.ts             (304B)  - 统一导出
   └── README.md            (7.8KB) - 组件文档

📁 src/renderer/src/store/
   └── floatStore.ts        (2.0KB) - 状态管理

📁 src/renderer/src/
   ├── FloatApp.tsx         (1.3KB) - 主应用
   ├── float.tsx            (309B)  - React入口
   └── index.css            (扩展)  - 动画样式

📁 src/renderer/
   └── float.html           (321B)  - HTML入口

📁 docs/
   ├── FLOAT_WINDOW_DEVELOPMENT.md  - 开发报告
   └── FLOAT_WINDOW_STRUCTURE.txt   - 结构文档
```

---

## 下一步：主进程集成

### 1. 创建悬浮窗窗口 (main process)

需要在主进程中创建：

```typescript
// src/main/windows/floatWindow.ts

import { BrowserWindow } from 'electron'

export function createFloatWindow() {
  const floatWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,              // 无边框
    transparent: true,         // 透明背景
    alwaysOnTop: true,        // 默认置顶
    resizable: false,         // 禁止调整大小
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  // 开发环境
  if (is.dev) {
    floatWindow.loadURL('http://localhost:5173/float.html')
  } else {
    floatWindow.loadFile('dist/renderer/float.html')
  }

  return floatWindow
}
```

### 2. 实现IPC Handlers

```typescript
// src/main/ipc/floatHandlers.ts

import { ipcMain } from 'electron'

// 窗口控制
ipcMain.on('float:minimize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  window?.minimize()
})

ipcMain.on('float:close', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  window?.close()
})

ipcMain.on('float:toggle-always-on-top', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  const isOnTop = !window?.isAlwaysOnTop()
  window?.setAlwaysOnTop(isOnTop)
  event.sender.send('float:always-on-top-changed', isOnTop)
})

// 文章采集
ipcMain.handle('float:collect-article', async (event, url: string) => {
  // TODO: 调用文章采集服务
  const article = await scrapeArticle(url)
  return article
})

// 获取最近文章
ipcMain.handle('float:get-recent-articles', async (event, limit: number) => {
  // TODO: 从数据库查询
  const articles = await db.getRecentArticles(limit)
  return articles
})

// 打开主窗口
ipcMain.on('float:open-main-window', (event, articleId?: string) => {
  const mainWindow = getMainWindow()
  mainWindow?.show()
  if (articleId) {
    mainWindow?.webContents.send('main:show-article', articleId)
  }
})
```

### 3. 配置Preload脚本

```typescript
// src/preload/index.ts

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // 窗口控制
  minimize: () => ipcRenderer.send('float:minimize'),
  close: () => ipcRenderer.send('float:close'),
  toggleAlwaysOnTop: () => ipcRenderer.send('float:toggle-always-on-top'),
  onAlwaysOnTopChanged: (callback) => {
    ipcRenderer.on('float:always-on-top-changed', (_, isOnTop) => callback(isOnTop))
  },

  // 文章操作
  collectArticle: (url: string) => ipcRenderer.invoke('float:collect-article', url),
  getRecentArticles: (limit?: number) => ipcRenderer.invoke('float:get-recent-articles', limit || 5),

  // 窗口通信
  openMainWindow: (articleId?: string) => ipcRenderer.send('float:open-main-window', articleId),
  
  // 窗口位置
  getWindowPosition: () => ipcRenderer.invoke('float:get-position'),
  setWindowPosition: (position) => ipcRenderer.send('float:set-position', position)
})
```

### 4. 全局快捷键注册

```typescript
// src/main/shortcuts.ts

import { globalShortcut, BrowserWindow } from 'electron'

export function registerFloatShortcuts(floatWindow: BrowserWindow) {
  // Ctrl+Shift+A - 显示/隐藏悬浮窗
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    if (floatWindow.isVisible()) {
      floatWindow.hide()
    } else {
      floatWindow.show()
    }
  })
}
```

### 5. 窗口位置持久化

```typescript
// src/main/store/windowStore.ts

import Store from 'electron-store'

interface WindowBounds {
  x: number
  y: number
  width: number
  height: number
}

const store = new Store<{ floatWindow: WindowBounds }>()

export function saveFloatWindowPosition(bounds: WindowBounds) {
  store.set('floatWindow', bounds)
}

export function getFloatWindowPosition(): WindowBounds | undefined {
  return store.get('floatWindow')
}
```

---

## Vite配置

确保 `vite.config.ts` 支持多页面：

```typescript
export default {
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        float: resolve(__dirname, 'float.html')  // 新增悬浮窗入口
      }
    }
  }
}
```

---

## 依赖安装

确保已安装必要的依赖：

```bash
# Zustand状态管理
npm install zustand

# Electron Store（用于窗口位置持久化）
npm install electron-store
```

---

## 测试检查清单

### UI组件测试
- [ ] FloatLayout显示正常
- [ ] 拖动标题栏可移动窗口
- [ ] 置顶按钮正常切换
- [ ] 最小化/关闭按钮有效

### 功能测试
- [ ] URL输入框验证微信链接
- [ ] 粘贴链接自动填充
- [ ] 拖放链接到DropZone
- [ ] 采集按钮触发采集
- [ ] 采集成功后显示在列表

### 状态管理测试
- [ ] 窗口位置持久化
- [ ] 置顶状态持久化
- [ ] 常用标签持久化
- [ ] 刷新后状态恢复

### 交互测试
- [ ] 标签选择多选有效
- [ ] 新建标签功能正常
- [ ] 文章卡片点击打开主窗口
- [ ] 收藏按钮切换状态

### 快捷键测试
- [ ] Ctrl+Shift+A显示/隐藏
- [ ] Enter快速采集
- [ ] Escape取消输入

---

## 常见问题

### Q: 悬浮窗无法拖动？
A: 检查 `-webkit-app-region: drag` 是否正确设置在标题栏上。

### Q: 窗口透明背景无效？
A: 确保主进程中设置了 `transparent: true` 和 `frame: false`。

### Q: IPC通信失败？
A: 检查preload脚本是否正确注入，contextBridge是否正确配置。

### Q: 状态无法持久化？
A: 检查Zustand的persist中间件配置，确保partialize正确。

### Q: 全局快捷键不生效？
A: 检查快捷键是否被其他应用占用，尝试更换组合键。

---

## 性能建议

1. **虚拟滚动**: 文章列表超过100篇时使用react-window
2. **防抖优化**: URL验证添加300ms防抖
3. **懒加载**: 文章封面图使用懒加载
4. **内存管理**: 定期清理过期的recentArticles

---

## 调试技巧

### 开启开发者工具
```typescript
floatWindow.webContents.openDevTools({ mode: 'detach' })
```

### 查看IPC日志
```typescript
ipcMain.on('*', (event, ...args) => {
  console.log('IPC Event:', event.sender.eventNames(), args)
})
```

### 监控状态变化
```typescript
useFloatStore.subscribe((state) => {
  console.log('State changed:', state)
})
```

---

## 参考资源

- 📚 组件文档: `src/renderer/src/components/FloatWindow/README.md`
- 📊 开发报告: `FLOAT_WINDOW_DEVELOPMENT.md`
- 📁 结构文档: `FLOAT_WINDOW_STRUCTURE.txt`
- 🎨 UI设计: `dosc/UI界面设计_中文版.txt`

---

## 联系支持

如有问题，请查阅：
1. 组件内的JSDoc注释
2. README.md文档
3. TypeScript类型定义

---

**开发完成日期**: 2025-10-06  
**版本**: v1.0.0  
**状态**: ✅ 就绪，等待主进程集成
