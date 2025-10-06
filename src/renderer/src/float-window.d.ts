/**
 * 悬浮窗全局类型定义
 * 此文件专门为悬浮窗定义Window.api类型，避免与主窗口类型冲突
 */

import type { Article } from './types/article';

/**
 * 悬浮窗位置
 */
export interface WindowPosition {
  x: number;
  y: number;
}

/**
 * 悬浮窗API类型定义
 */
export interface FloatWindowAPI {
  // 窗口控制
  minimize: () => void;
  close: () => void;
  toggleAlwaysOnTop: () => void;
  onAlwaysOnTopChanged: (callback: (isOnTop: boolean) => void) => void;

  // 文章操作
  collectArticle: (url: string) => Promise<Article>;
  getRecentArticles: (limit?: number) => Promise<Article[]>;

  // 窗口通信
  openMainWindow: (articleId?: string) => void;
  getWindowPosition: () => Promise<WindowPosition>;
  setWindowPosition: (position: WindowPosition) => void;
}

declare global {
  interface Window {
    api: FloatWindowAPI;
  }
}
