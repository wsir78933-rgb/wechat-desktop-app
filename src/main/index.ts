/**
 * 主进程入口文件
 * 创建应用窗口并注册所有IPC处理器
 */

import { app, BrowserWindow, shell, globalShortcut } from 'electron';
import { join } from 'path';
import { registerAllIpcHandlers, unregisterAllIpcHandlers } from './ipc';
import { floatWindow } from './windows/floatWindow';
import { windowManager } from './ipc/window';

// 主窗口实例
let mainWindow: BrowserWindow | null = null;

/**
 * 创建主窗口
 */
function createWindow() {
  console.log('[Main] 创建主窗口...');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false, // 窗口准备好后再显示
    autoHideMenuBar: true, // 隐藏菜单栏
    backgroundColor: '#ffffff',
    webPreferences: {
      // 安全配置
      nodeIntegration: false, // 禁用node集成
      contextIsolation: true, // 启用上下文隔离
      sandbox: true, // 启用沙箱模式
      webSecurity: true, // 启用web安全
      allowRunningInsecureContent: false, // 禁止不安全内容

      // Preload脚本
      preload: join(__dirname, '../preload/index.js'),
    },
  });

  // 窗口准备好后显示
  mainWindow.on('ready-to-show', () => {
    console.log('[Main] 窗口准备完成，显示窗口');
    mainWindow?.show();

    // 开发环境打开DevTools
    if (process.env.NODE_ENV === 'development') {
      mainWindow?.webContents.openDevTools();
    }
  });

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    console.log('[Main] 窗口已关闭');
    mainWindow = null;
  });

  // 拦截新窗口打开，使用默认浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('[Main] 拦截新窗口打开:', url);

    // 只允许https协议
    if (url.startsWith('https://')) {
      shell.openExternal(url);
    }

    return { action: 'deny' };
  });

  // 加载应用页面
  if (process.env.NODE_ENV === 'development') {
    const rendererUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    console.log('[Main] 开发模式，加载:', rendererUrl);
    mainWindow.loadURL(rendererUrl);
  } else {
    console.log('[Main] 生产模式，加载本地文件');
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  console.log('[Main] ✅ 主窗口创建完成');

  // 将主窗口引用传递给窗口管理器
  windowManager.setMainWindow(mainWindow);
}

/**
 * 创建悬浮窗
 */
function createFloatWindow() {
  console.log('[Main] 创建悬浮窗...');

  try {
    const floatWin = floatWindow.create();

    // 将悬浮窗引用传递给窗口管理器
    windowManager.setFloatWindow(floatWin);

    console.log('[Main] ✅ 悬浮窗创建完成');
  } catch (error) {
    console.error('[Main] ❌ 悬浮窗创建失败:', error);
  }
}

/**
 * 注册全局快捷键
 */
function registerGlobalShortcuts() {
  console.log('[Main] 注册全局快捷键...');

  try {
    // Ctrl+Shift+A: 显示/隐藏悬浮窗
    const ret = globalShortcut.register('CommandOrControl+Shift+A', () => {
      console.log('[Main] 快捷键触发: Ctrl+Shift+A - 切换悬浮窗');
      floatWindow.toggle();
    });

    if (!ret) {
      console.error('[Main] ❌ 快捷键注册失败: CommandOrControl+Shift+A');
    } else {
      console.log('[Main] ✅ 快捷键已注册: Ctrl+Shift+A (切换悬浮窗)');
    }

    // 验证快捷键是否注册成功
    const isRegistered = globalShortcut.isRegistered('CommandOrControl+Shift+A');
    console.log('[Main] 快捷键注册状态:', isRegistered ? '成功' : '失败');
  } catch (error) {
    console.error('[Main] ❌ 快捷键注册失败:', error);
  }
}

/**
 * 注销全局快捷键
 */
function unregisterGlobalShortcuts() {
  console.log('[Main] 注销全局快捷键...');
  globalShortcut.unregisterAll();
  console.log('[Main] ✅ 全局快捷键已注销');
}

/**
 * 应用准备完成
 */
app.whenReady().then(() => {
  console.log('[Main] 应用准备完成');
  console.log('[Main] Electron版本:', process.versions.electron);
  console.log('[Main] Node版本:', process.versions.node);
  console.log('[Main] Chrome版本:', process.versions.chrome);

  // 注册所有IPC处理器
  registerAllIpcHandlers();

  // 创建主窗口
  createWindow();

  // 创建悬浮窗
  createFloatWindow();

  // 注册全局快捷键
  registerGlobalShortcuts();

  // macOS特性：点击dock图标时重新创建窗口
  app.on('activate', () => {
    console.log('[Main] 应用激活');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
    // 如果悬浮窗不存在，也重新创建
    if (!floatWindow.exists()) {
      createFloatWindow();
    }
  });
});

/**
 * 所有窗口关闭
 */
app.on('window-all-closed', () => {
  console.log('[Main] 所有窗口已关闭');

  // macOS上保持应用运行
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * 应用退出前清理
 */
app.on('before-quit', () => {
  console.log('[Main] 应用即将退出，开始清理...');

  // 注销全局快捷键
  unregisterGlobalShortcuts();

  // 清理所有IPC处理器
  unregisterAllIpcHandlers();

  // 清理窗口引用
  windowManager.setMainWindow(null);
  windowManager.setFloatWindow(null);

  console.log('[Main] 清理完成');
});

/**
 * 应用退出
 */
app.on('quit', () => {
  console.log('[Main] 应用已退出');
});

/**
 * 错误处理
 */
process.on('uncaughtException', (error) => {
  console.error('[Main] 未捕获的异常:', error);
  // 生产环境可以在这里添加错误上报
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Main] 未处理的Promise拒绝:', reason);
  console.error('[Main] Promise:', promise);
});

// 导出主窗口实例供其他模块使用
export { mainWindow };
