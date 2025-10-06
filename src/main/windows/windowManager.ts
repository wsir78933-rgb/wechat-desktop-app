import { ipcMain, IpcMainEvent } from 'electron';
import { mainWindow } from './mainWindow';
import { floatWindow } from './floatWindow';

/**
 * 窗口管理器 - 统一管理所有窗口和窗口间通信
 */
export class WindowManager {
  private static instance: WindowManager;

  private constructor() {
    this.setupIpcHandlers();
  }

  /**
   * 获取窗口管理器单例
   */
  public static getInstance(): WindowManager {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  /**
   * 初始化所有窗口
   */
  public initializeWindows(): void {
    // 创建主窗口
    mainWindow.create();

    // 悬浮窗默认不创建，按需创建
    // floatWindow.create();
  }

  /**
   * 设置 IPC 通信处理器
   */
  private setupIpcHandlers(): void {
    // 主窗口控制
    ipcMain.handle('main-window:show', () => {
      mainWindow.show();
      return { success: true };
    });

    ipcMain.handle('main-window:hide', () => {
      mainWindow.hide();
      return { success: true };
    });

    ipcMain.handle('main-window:toggle-devtools', () => {
      mainWindow.toggleDevTools();
      return { success: true };
    });

    // 悬浮窗控制
    ipcMain.handle('float-window:create', () => {
      if (!floatWindow.exists()) {
        floatWindow.create();
      }
      return { success: true };
    });

    ipcMain.handle('float-window:show', () => {
      if (!floatWindow.exists()) {
        floatWindow.create();
      } else {
        floatWindow.show();
      }
      return { success: true };
    });

    ipcMain.handle('float-window:hide', () => {
      floatWindow.hide();
      return { success: true };
    });

    ipcMain.handle('float-window:toggle', () => {
      if (!floatWindow.exists()) {
        floatWindow.create();
      } else {
        floatWindow.toggle();
      }
      return { success: true, visible: floatWindow.isVisible() };
    });

    ipcMain.handle('float-window:close', () => {
      floatWindow.close();
      return { success: true };
    });

    // 悬浮窗位置和大小控制
    ipcMain.handle('float-window:set-position', (_event, x: number, y: number) => {
      floatWindow.setPosition(x, y);
      return { success: true };
    });

    ipcMain.handle('float-window:get-position', () => {
      return floatWindow.getPosition();
    });

    ipcMain.handle('float-window:set-size', (_event, width: number, height: number) => {
      floatWindow.setSize(width, height);
      return { success: true };
    });

    ipcMain.handle('float-window:get-size', () => {
      return floatWindow.getSize();
    });

    ipcMain.handle('float-window:move-to-center', () => {
      floatWindow.moveToCenter();
      return { success: true };
    });

    ipcMain.handle('float-window:move-to-right', () => {
      floatWindow.moveToRight();
      return { success: true };
    });

    // 悬浮窗属性控制
    ipcMain.handle('float-window:set-always-on-top', (_event, flag: boolean) => {
      floatWindow.setAlwaysOnTop(flag);
      return { success: true };
    });

    ipcMain.handle('float-window:set-opacity', (_event, opacity: number) => {
      floatWindow.setOpacity(opacity);
      return { success: true };
    });

    // 窗口间消息转发
    ipcMain.on('window:send-to-main', (_event, data) => {
      mainWindow.sendMessage('from-float-window', data);
    });

    ipcMain.on('window:send-to-float', (_event, data) => {
      floatWindow.sendMessage('from-main-window', data);
    });

    // 广播消息到所有窗口
    ipcMain.on('window:broadcast', (_event, channel: string, data: any) => {
      this.broadcast(channel, data);
    });

    // 窗口状态查询
    ipcMain.handle('window:get-states', () => {
      return {
        main: {
          exists: mainWindow.exists(),
        },
        float: {
          exists: floatWindow.exists(),
          visible: floatWindow.isVisible(),
          position: floatWindow.getPosition(),
          size: floatWindow.getSize(),
        },
      };
    });
  }

  /**
   * 广播消息到所有窗口
   */
  public broadcast(channel: string, data: any): void {
    if (mainWindow.exists()) {
      mainWindow.sendMessage(channel, data);
    }
    if (floatWindow.exists()) {
      floatWindow.sendMessage(channel, data);
    }
  }

  /**
   * 发送消息到主窗口
   */
  public sendToMain(channel: string, data: any): void {
    mainWindow.sendMessage(channel, data);
  }

  /**
   * 发送消息到悬浮窗
   */
  public sendToFloat(channel: string, data: any): void {
    floatWindow.sendMessage(channel, data);
  }

  /**
   * 关闭所有窗口
   */
  public closeAll(): void {
    floatWindow.close();
    mainWindow.close();
  }

  /**
   * 获取主窗口实例
   */
  public getMainWindow() {
    return mainWindow;
  }

  /**
   * 获取悬浮窗实例
   */
  public getFloatWindow() {
    return floatWindow;
  }
}

// 导出单例实例
export const windowManager = WindowManager.getInstance();
