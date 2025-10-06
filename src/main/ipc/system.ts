/**
 * 系统相关IPC处理器
 * 处理系统路径、外部链接打开等系统级操作
 */

import { ipcMain, shell, app } from 'electron';
import { IPC_CHANNELS } from '../../types/ipc';

/**
 * 注册系统相关的IPC处理器
 */
export function registerSystemHandlers() {
  // ============= 获取系统路径 =============
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_PATH, async (_event, name: string): Promise<string> => {
    console.log(`[IPC] 获取系统路径: name=${name}`);

    try {
      switch (name) {
        case 'home':
          return app.getPath('home');
        case 'appData':
          return app.getPath('appData');
        case 'userData':
          return app.getPath('userData');
        case 'temp':
          return app.getPath('temp');
        case 'desktop':
          return app.getPath('desktop');
        case 'documents':
          return app.getPath('documents');
        case 'downloads':
          return app.getPath('downloads');
        case 'pictures':
          return app.getPath('pictures');
        case 'app':
          return app.getAppPath();
        default:
          throw new Error(`未知的路径名称: ${name}`);
      }
    } catch (error) {
      console.error('[IPC] 获取系统路径失败:', error);
      return '';
    }
  });

  // ============= 打开外部链接 =============
  ipcMain.handle(IPC_CHANNELS.SYSTEM_OPEN_EXTERNAL, async (_event, url: string): Promise<void> => {
    console.log(`[IPC] 打开外部链接: url=${url}`);

    try {
      // 验证URL格式
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(url)) {
        throw new Error('无效的URL格式');
      }

      // 安全检查：防止打开本地文件协议
      if (url.startsWith('file://')) {
        throw new Error('不允许打开本地文件');
      }

      await shell.openExternal(url);
    } catch (error) {
      console.error('[IPC] 打开外部链接失败:', error);
      throw error;
    }
  });

  console.log('[IPC] 系统处理器注册完成');
}

/**
 * 清理系统相关的IPC处理器
 */
export function unregisterSystemHandlers() {
  ipcMain.removeHandler(IPC_CHANNELS.SYSTEM_GET_PATH);
  ipcMain.removeHandler(IPC_CHANNELS.SYSTEM_OPEN_EXTERNAL);

  console.log('[IPC] 系统处理器已清理');
}
