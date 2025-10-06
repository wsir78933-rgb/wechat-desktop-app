/**
 * 窗口相关IPC处理器
 * 处理窗口控制相关的IPC调用
 */

import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../types/ipc';
import type { WindowType, WindowPosition, WindowSize } from '../../types/ipc';
import { configStore } from '../config/store';

/**
 * 窗口管理器
 */
class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private floatWindow: BrowserWindow | null = null;

  /**
   * 设置主窗口引用
   */
  setMainWindow(window: BrowserWindow | null): void {
    this.mainWindow = window;
    console.log('[WindowManager] 主窗口引用已设置');
  }

  /**
   * 设置悬浮窗引用
   */
  setFloatWindow(window: BrowserWindow | null): void {
    this.floatWindow = window;
    console.log('[WindowManager] 悬浮窗引用已设置');
  }

  /**
   * 获取窗口实例
   */
  private getWindow(type: WindowType = 'main'): BrowserWindow | null {
    const window = type === 'main' ? this.mainWindow : this.floatWindow;

    if (!window || window.isDestroyed()) {
      console.error(`[WindowManager] ${type === 'main' ? '主' : '悬浮'}窗口不存在或已销毁`);
      return null;
    }

    return window;
  }

  /**
   * 获取当前发送IPC的窗口（从事件中获取）
   */
  private getCurrentWindow(event: Electron.IpcMainInvokeEvent): BrowserWindow | null {
    const webContents = event.sender;
    const window = BrowserWindow.fromWebContents(webContents);

    if (!window || window.isDestroyed()) {
      console.error('[WindowManager] 无法获取当前窗口');
      return null;
    }

    return window;
  }

  /**
   * 最小化窗口
   */
  minimize(event: Electron.IpcMainInvokeEvent, windowType?: WindowType): void {
    const window = windowType ? this.getWindow(windowType) : this.getCurrentWindow(event);

    if (window) {
      window.minimize();
      console.log(`[WindowManager] 窗口已最小化: ${windowType || 'current'}`);
    }
  }

  /**
   * 关闭窗口
   */
  close(event: Electron.IpcMainInvokeEvent, windowType?: WindowType): void {
    const window = windowType ? this.getWindow(windowType) : this.getCurrentWindow(event);

    if (window) {
      // 如果是悬浮窗，只隐藏不关闭
      if (windowType === 'float') {
        window.hide();
        console.log('[WindowManager] 悬浮窗已隐藏');
      } else {
        window.close();
        console.log(`[WindowManager] 窗口已关闭: ${windowType || 'current'}`);
      }
    }
  }

  /**
   * 切换窗口置顶状态
   */
  toggleAlwaysOnTop(event: Electron.IpcMainInvokeEvent, windowType?: WindowType): boolean {
    const window = windowType ? this.getWindow(windowType) : this.getCurrentWindow(event);

    if (window) {
      const currentState = window.isAlwaysOnTop();
      const newState = !currentState;

      window.setAlwaysOnTop(newState, newState ? 'floating' : 'normal');
      console.log(`[WindowManager] 窗口置顶状态已切换: ${currentState} -> ${newState}`);

      // 如果是悬浮窗，保存状态
      if (windowType === 'float') {
        configStore.setFloatWindowAlwaysOnTop(newState);
      }

      return newState;
    }

    return false;
  }

  /**
   * 获取窗口位置
   */
  getPosition(event: Electron.IpcMainInvokeEvent, windowType?: WindowType): WindowPosition {
    const window = windowType ? this.getWindow(windowType) : this.getCurrentWindow(event);

    if (window) {
      const [x, y] = window.getPosition();
      console.log(`[WindowManager] 获取窗口位置: x=${x}, y=${y}`);
      return { x, y };
    }

    return { x: 0, y: 0 };
  }

  /**
   * 设置窗口位置
   */
  setPosition(event: Electron.IpcMainInvokeEvent, windowType: WindowType, x: number, y: number): void {
    const window = this.getWindow(windowType);

    if (window) {
      window.setPosition(x, y);
      console.log(`[WindowManager] 设置窗口位置: x=${x}, y=${y}`);

      // 如果是悬浮窗，保存位置
      if (windowType === 'float') {
        const size = this.getSize(event, windowType);
        configStore.setFloatWindowPosition({ x, y, ...size });
      }
    }
  }

  /**
   * 获取窗口大小
   */
  getSize(event: Electron.IpcMainInvokeEvent, windowType?: WindowType): WindowSize {
    const window = windowType ? this.getWindow(windowType) : this.getCurrentWindow(event);

    if (window) {
      const [width, height] = window.getSize();
      console.log(`[WindowManager] 获取窗口大小: width=${width}, height=${height}`);
      return { width, height };
    }

    return { width: 0, height: 0 };
  }

  /**
   * 设置窗口大小
   */
  setSize(event: Electron.IpcMainInvokeEvent, windowType: WindowType, width: number, height: number): void {
    const window = this.getWindow(windowType);

    if (window) {
      window.setSize(width, height);
      console.log(`[WindowManager] 设置窗口大小: width=${width}, height=${height}`);

      // 如果是悬浮窗，保存大小
      if (windowType === 'float') {
        const position = this.getPosition(event, windowType);
        configStore.setFloatWindowPosition({ ...position, width, height });
      }
    }
  }

  /**
   * 打开主窗口
   */
  openMain(_event: Electron.IpcMainInvokeEvent, articleId?: number): void {
    if (!this.mainWindow) {
      console.error('[WindowManager] 主窗口不存在，无法打开');
      return;
    }

    // 显示并聚焦主窗口
    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();
    }

    this.mainWindow.show();
    this.mainWindow.focus();

    console.log(`[WindowManager] 主窗口已打开${articleId ? `, 文章ID: ${articleId}` : ''}`);

    // 如果有文章ID，发送消息到主窗口渲染进程
    if (articleId && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('article:open', articleId);
    }
  }

  /**
   * 显示悬浮窗
   */
  showFloat(): void {
    if (this.floatWindow && !this.floatWindow.isDestroyed()) {
      this.floatWindow.show();
      this.floatWindow.focus();
      console.log('[WindowManager] 悬浮窗已显示');
    } else {
      console.error('[WindowManager] 悬浮窗不存在，无法显示');
    }
  }

  /**
   * 隐藏悬浮窗
   */
  hideFloat(): void {
    if (this.floatWindow && !this.floatWindow.isDestroyed()) {
      this.floatWindow.hide();
      console.log('[WindowManager] 悬浮窗已隐藏');
    }
  }

  /**
   * 切换悬浮窗显示/隐藏
   */
  toggleFloat(): void {
    if (this.floatWindow && !this.floatWindow.isDestroyed()) {
      if (this.floatWindow.isVisible()) {
        this.hideFloat();
      } else {
        this.showFloat();
      }
    } else {
      console.error('[WindowManager] 悬浮窗不存在，无法切换');
    }
  }
}

// 创建窗口管理器单例
export const windowManager = new WindowManager();

/**
 * 注册所有窗口相关的IPC处理器
 */
export function registerWindowHandlers(): void {
  console.log('[IPC] 注册窗口控制处理器...');

  // 最小化窗口
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, (event, windowType?: WindowType) => {
    windowManager.minimize(event, windowType);
  });

  // 关闭窗口
  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, (event, windowType?: WindowType) => {
    windowManager.close(event, windowType);
  });

  // 切换置顶状态
  ipcMain.handle(IPC_CHANNELS.WINDOW_TOGGLE_ALWAYS_ON_TOP, (event, windowType?: WindowType) => {
    return windowManager.toggleAlwaysOnTop(event, windowType);
  });

  // 获取窗口位置
  ipcMain.handle(IPC_CHANNELS.WINDOW_GET_POSITION, (event, windowType?: WindowType) => {
    return windowManager.getPosition(event, windowType);
  });

  // 设置窗口位置
  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_POSITION, (event, windowType: WindowType, x: number, y: number) => {
    windowManager.setPosition(event, windowType, x, y);
  });

  // 获取窗口大小
  ipcMain.handle(IPC_CHANNELS.WINDOW_GET_SIZE, (event, windowType?: WindowType) => {
    return windowManager.getSize(event, windowType);
  });

  // 设置窗口大小
  ipcMain.handle(IPC_CHANNELS.WINDOW_SET_SIZE, (event, windowType: WindowType, width: number, height: number) => {
    windowManager.setSize(event, windowType, width, height);
  });

  // 打开主窗口
  ipcMain.handle(IPC_CHANNELS.WINDOW_OPEN_MAIN, (event, articleId?: number) => {
    windowManager.openMain(event, articleId);
  });

  // 显示悬浮窗
  ipcMain.handle(IPC_CHANNELS.WINDOW_SHOW_FLOAT, () => {
    windowManager.showFloat();
  });

  // 隐藏悬浮窗
  ipcMain.handle(IPC_CHANNELS.WINDOW_HIDE_FLOAT, () => {
    windowManager.hideFloat();
  });

  // 切换悬浮窗
  ipcMain.handle(IPC_CHANNELS.WINDOW_TOGGLE_FLOAT, () => {
    windowManager.toggleFloat();
  });

  console.log('[IPC] ✅ 窗口控制处理器注册完成');
}

/**
 * 注销所有窗口相关的IPC处理器
 */
export function unregisterWindowHandlers(): void {
  console.log('[IPC] 注销窗口控制处理器...');

  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_MINIMIZE);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_CLOSE);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_TOGGLE_ALWAYS_ON_TOP);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_GET_POSITION);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_SET_POSITION);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_GET_SIZE);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_SET_SIZE);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_OPEN_MAIN);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_SHOW_FLOAT);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_HIDE_FLOAT);
  ipcMain.removeHandler(IPC_CHANNELS.WINDOW_TOGGLE_FLOAT);

  console.log('[IPC] ✅ 窗口控制处理器注销完成');
}
