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
 * 注意：此类型与主窗口的IpcApi类型冲突，已在src/types/ipc.ts中统一定义为联合类型
 * 实际使用的是 IpcApi 接口，这里保留用于类型兼容
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

  // 添加缺失的属性以匹配 IpcApi
  window: {
    minimize: (windowType?: 'main' | 'float') => Promise<void>;
    close: (windowType?: 'main' | 'float') => Promise<void>;
    toggleAlwaysOnTop: (windowType?: 'main' | 'float') => Promise<boolean>;
    getPosition: (windowType?: 'main' | 'float') => Promise<WindowPosition>;
    setPosition: (windowType: 'main' | 'float', x: number, y: number) => Promise<void>;
    getSize: (windowType?: 'main' | 'float') => Promise<{ width: number; height: number }>;
    setSize: (windowType: 'main' | 'float', width: number, height: number) => Promise<void>;
    openMain: (articleId?: number) => Promise<void>;
    showFloat: () => Promise<void>;
    hideFloat: () => Promise<void>;
    toggleFloat: () => Promise<void>;
  };

  // 添加 scrapeArticles 方法
  scrapeArticles: (params: import('./article').ScrapeParams) => Promise<import('./article').ScrapeResult>;
}
