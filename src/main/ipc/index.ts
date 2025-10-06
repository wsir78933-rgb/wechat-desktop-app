/**
 * IPC处理器统一注册入口
 * 集中管理所有IPC处理器的注册和清理
 */

import { registerArticleHandlers, unregisterArticleHandlers } from './article';
import { registerTagHandlers, unregisterTagHandlers } from './tag';
import { registerSearchHandlers, unregisterSearchHandlers } from './search';
import { registerSystemHandlers, unregisterSystemHandlers } from './system';
import { registerWindowHandlers, unregisterWindowHandlers } from './window';

/**
 * 注册所有IPC处理器
 * 在主进程启动时调用
 */
export function registerAllIpcHandlers() {
  console.log('[IPC] 开始注册所有IPC处理器...');

  try {
    // 注册各模块的处理器
    registerArticleHandlers();
    registerTagHandlers();
    registerSearchHandlers();
    registerSystemHandlers();
    registerWindowHandlers();

    console.log('[IPC] ✅ 所有IPC处理器注册完成');
  } catch (error) {
    console.error('[IPC] ❌ IPC处理器注册失败:', error);
    throw error;
  }
}

/**
 * 清理所有IPC处理器
 * 在应用退出前调用
 */
export function unregisterAllIpcHandlers() {
  console.log('[IPC] 开始清理所有IPC处理器...');

  try {
    unregisterArticleHandlers();
    unregisterTagHandlers();
    unregisterSearchHandlers();
    unregisterSystemHandlers();
    unregisterWindowHandlers();

    console.log('[IPC] ✅ 所有IPC处理器清理完成');
  } catch (error) {
    console.error('[IPC] ❌ IPC处理器清理失败:', error);
  }
}

// 导出单个模块（供按需使用）
export {
  registerArticleHandlers,
  unregisterArticleHandlers,
  registerTagHandlers,
  unregisterTagHandlers,
  registerSearchHandlers,
  unregisterSearchHandlers,
  registerSystemHandlers,
  unregisterSystemHandlers,
  registerWindowHandlers,
  unregisterWindowHandlers,
};
