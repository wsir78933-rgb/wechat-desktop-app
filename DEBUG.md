# Electron 调试指南

## 🎯 调试配置已完成

已为项目配置了完整的调试环境，包括主进程和渲染进程调试。

## 📋 调试方式

### 方式一：使用 VSCode 调试器（推荐）

#### 1. **调试主进程**
- 在 VSCode 中按 `F5` 或点击"运行和调试"
- 选择 **"调试主进程"**
- 可以在主进程代码中设置断点（src/main/**/*.ts）
- 支持变量查看、调用栈追踪等完整调试功能

#### 2. **调试渲染进程**
- 先启动 `npm run dev`
- 在 VSCode 中选择 **"调试渲染进程"**
- 可以在渲染进程代码中设置断点（src/renderer/**/*.tsx）

#### 3. **同时调试主进程和渲染进程**
- 选择 **"调试主进程 & 渲染进程"**
- 这会同时启动两个调试会话
- 可以在主进程和渲染进程中同时设置断点

### 方式二：使用 Chrome DevTools

#### 1. **启动调试模式**
```bash
npm run dev:debug
```

#### 2. **主进程调试**
- 在 Chrome 浏览器中打开：`chrome://inspect`
- 点击 "Configure..." 添加：`localhost:5858`
- 点击 "inspect" 开始调试主进程

#### 3. **渲染进程调试**
- 应用启动后会自动打开 DevTools
- 或在应用中按 `Ctrl+Shift+I` (Windows/Linux) 或 `Cmd+Option+I` (Mac)

### 方式三：命令行调试

#### 1. **查看控制台日志**
```bash
npm run dev
```
所有 `console.log` 输出会显示在终端中

#### 2. **启用详细日志**
在代码中已配置了详细的日志输出：
- `[Preload]` - Preload脚本日志
- `[IPC]` - IPC通信日志
- `[Main]` - 主进程日志
- `[Renderer]` - 渲染进程日志

## 🔍 常见调试场景

### 1. **调试 IPC 通信问题**

在 `src/preload/index.ts` 中设置断点：
```typescript
createArticle: (article) => {
  console.log('[Preload] 调用: createArticle', article);  // <- 在这里设置断点
  return safeInvoke(IPC_CHANNELS.ARTICLE_CREATE, article);
}
```

在 `src/main/ipc/article.ts` 中设置断点：
```typescript
ipcMain.handle(
  IPC_CHANNELS.ARTICLE_CREATE,
  async (_event, article: Partial<Article>): Promise<Article> => {
    console.log('[IPC] 手动创建文章:', article);  // <- 在这里设置断点
    // ...
  }
)
```

### 2. **调试文章采集功能**

在 `src/main/scrapers/wechat.ts` 中设置断点：
```typescript
async scrapeArticle(url: string): Promise<ScrapeResult> {
  console.log('[Scraper] 开始采集:', url);  // <- 在这里设置断点
  // ...
}
```

### 3. **调试 UI 组件**

在 React 组件中设置断点：
```typescript
const handleSubmit = async () => {
  console.log('提交文章数据');  // <- 在这里设置断点
  await window.api.createArticle(formData);
}
```

## 🛠️ 调试工具

### VSCode 断点类型
- **普通断点**：点击行号左侧设置
- **条件断点**：右键断点，添加条件表达式
- **日志点**：在不中断执行的情况下输出日志
- **函数断点**：在特定函数被调用时中断

### Chrome DevTools 功能
- **Elements**：检查 DOM 结构和样式
- **Console**：查看日志和执行 JavaScript
- **Sources**：设置断点和单步调试
- **Network**：监控网络请求
- **Performance**：性能分析
- **Memory**：内存泄漏检测

## 📊 性能分析

### 1. **主进程性能**
```bash
# 使用 Node.js 性能分析
node --inspect --inspect-brk out/main/index.js
```

### 2. **渲染进程性能**
- 在 Chrome DevTools 中使用 Performance 面板
- 录制用户交互
- 分析帧率、重绘、重排等

## 🔧 调试配置文件

### `.vscode/launch.json`
包含以下调试配置：
- `调试主进程`：调试 Electron 主进程
- `调试渲染进程`：调试 React 渲染进程
- `调试全部`：同时调试主进程和渲染进程

### `.vscode/tasks.json`
包含以下任务：
- `npm: dev`：启动开发服务器
- `停止开发服务器`：停止所有 Electron 进程
- `重启开发服务器`：重启开发环境

## 💡 调试技巧

### 1. **快速定位问题**
- 使用搜索功能找到相关代码：`Ctrl+Shift+F` (Windows/Linux) 或 `Cmd+Shift+F` (Mac)
- 查看调用栈了解函数调用路径
- 使用 "Watch" 面板监控变量值变化

### 2. **IPC 通信调试**
- 在 Preload 脚本中查看 API 调用
- 在主进程 IPC 处理器中查看接收到的数据
- 检查通道名称是否匹配

### 3. **React 组件调试**
- 安装 React Developer Tools 浏览器扩展
- 检查组件状态和 Props
- 使用 Profiler 分析渲染性能

### 4. **网络请求调试**
- 在 Network 面板查看所有 HTTP 请求
- 检查请求头、响应数据、状态码
- 模拟慢速网络测试

## ⚠️ 常见问题

### 1. **断点不生效**
- 确保 Source Maps 已启用
- 检查文件路径是否正确
- 尝试重启调试会话

### 2. **调试器无法连接**
- 检查端口是否被占用（5858, 9223）
- 确保防火墙未阻止连接
- 尝试重启 VSCode

### 3. **日志不显示**
- 检查 `NODE_ENV` 环境变量
- 确保在正确的进程中查看日志
- 主进程日志在终端，渲染进程日志在 DevTools Console

## 📚 相关资源

- [Electron 调试文档](https://www.electronjs.org/docs/latest/tutorial/debugging)
- [VSCode 调试指南](https://code.visualstudio.com/docs/editor/debugging)
- [Chrome DevTools 文档](https://developer.chrome.com/docs/devtools/)

## 🚀 开始调试

1. 在 VSCode 中打开项目
2. 按 `F5` 启动调试
3. 或运行 `npm run dev:debug` 使用 Chrome DevTools
4. 在代码中设置断点
5. 开始调试！

---

**提示**：调试时建议使用 VSCode 调试器，它提供了更好的集成体验和更强大的功能。
