/**
 * 渲染进程类型定义统一导出
 * 重新导出所有子模块的类型
 */

// 导出文章相关类型
export * from './article';

// 导出标签相关类型
export * from './tag';

// 导出UI组件类型
export * from './ui';

/**
 * 悬浮窗位置
 */
export interface WindowPosition {
  x: number;
  y: number;
}

/**
 * 采集状态
 */
export type CollectStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * 窗口API类型定义（用于悬浮窗）
 */
export interface WindowAPI {
  minimize: () => void;
  close: () => void;
  toggleAlwaysOnTop: () => void;
  onAlwaysOnTopChanged: (callback: (isOnTop: boolean) => void) => void;
  collectArticle: (url: string) => Promise<import('./article').Article>;
  getRecentArticles: (limit?: number) => Promise<import('./article').Article[]>;
  openMainWindow: (articleId?: string) => void;
  getWindowPosition: () => Promise<WindowPosition>;
  setWindowPosition: (position: WindowPosition) => void;
}

declare global {
  interface Window {
    api: WindowAPI;
  }
}
