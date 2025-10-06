/**
 * Preload脚本 - 安全的渲染进程和主进程通信桥接
 * 使用contextBridge暴露安全的API给渲染进程
 */

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../types/ipc';
import type { IpcApi } from '../types/ipc';

// ============= 白名单验证 =============
/**
 * 允许的IPC通道白名单
 * 只有在白名单中的通道才能被调用
 */
const ALLOWED_CHANNELS = Object.values(IPC_CHANNELS);

/**
 * 验证通道是否在白名单中
 */
function isValidChannel(channel: string): boolean {
  return ALLOWED_CHANNELS.includes(channel);
}

/**
 * 安全的IPC调用包装器
 */
function safeInvoke<T = any>(channel: string, ...args: any[]): Promise<T> {
  if (!isValidChannel(channel)) {
    console.error(`[Preload] 拒绝调用未授权的IPC通道: ${channel}`);
    return Promise.reject(new Error(`未授权的IPC通道: ${channel}`));
  }

  return ipcRenderer.invoke(channel, ...args);
}

/**
 * 安全的IPC监听包装器
 */
function safeOn(channel: string, callback: (...args: any[]) => void): void {
  if (!isValidChannel(channel)) {
    console.error(`[Preload] 拒绝监听未授权的IPC通道: ${channel}`);
    return;
  }

  ipcRenderer.on(channel, (_event, ...args) => callback(...args));
}

/**
 * 移除IPC监听器
 */
function safeOff(channel: string, callback: (...args: any[]) => void): void {
  if (!isValidChannel(channel)) {
    return;
  }

  ipcRenderer.removeListener(channel, callback);
}

// ============= 暴露安全的API到渲染进程 =============
const api: IpcApi = {
  // ============= 文章相关API =============
  scrapeArticles: (params) => {
    console.log('[Preload] 调用: scrapeArticles', params);
    return safeInvoke(IPC_CHANNELS.ARTICLE_SCRAPE, params);
  },

  getAllArticles: (limit = 50, offset = 0) => {
    console.log('[Preload] 调用: getAllArticles', { limit, offset });
    return safeInvoke(IPC_CHANNELS.ARTICLE_GET_ALL, limit, offset);
  },

  getArticleById: (id) => {
    console.log('[Preload] 调用: getArticleById', id);
    return safeInvoke(IPC_CHANNELS.ARTICLE_GET_BY_ID, id);
  },

  deleteArticle: (id) => {
    console.log('[Preload] 调用: deleteArticle', id);
    return safeInvoke(IPC_CHANNELS.ARTICLE_DELETE, id);
  },

  updateArticle: (id, article) => {
    console.log('[Preload] 调用: updateArticle', { id, article });
    return safeInvoke(IPC_CHANNELS.ARTICLE_UPDATE, id, article);
  },

  exportArticles: (params) => {
    console.log('[Preload] 调用: exportArticles', params);
    return safeInvoke(IPC_CHANNELS.ARTICLE_EXPORT, params);
  },

  onScrapeProgress: (callback) => {
    console.log('[Preload] 注册: onScrapeProgress');
    safeOn(IPC_CHANNELS.ARTICLE_SCRAPE_PROGRESS, callback);
  },

  // ============= 标签相关API =============
  getAllTags: () => {
    console.log('[Preload] 调用: getAllTags');
    return safeInvoke(IPC_CHANNELS.TAG_GET_ALL);
  },

  createTag: (name, color) => {
    console.log('[Preload] 调用: createTag', { name, color });
    return safeInvoke(IPC_CHANNELS.TAG_CREATE, name, color);
  },

  updateTag: (id, name, color) => {
    console.log('[Preload] 调用: updateTag', { id, name, color });
    return safeInvoke(IPC_CHANNELS.TAG_UPDATE, id, name, color);
  },

  deleteTag: (id) => {
    console.log('[Preload] 调用: deleteTag', id);
    return safeInvoke(IPC_CHANNELS.TAG_DELETE, id);
  },

  addTagToArticle: (articleId, tagId) => {
    console.log('[Preload] 调用: addTagToArticle', { articleId, tagId });
    return safeInvoke(IPC_CHANNELS.TAG_ADD_TO_ARTICLE, articleId, tagId);
  },

  removeTagFromArticle: (articleId, tagId) => {
    console.log('[Preload] 调用: removeTagFromArticle', { articleId, tagId });
    return safeInvoke(IPC_CHANNELS.TAG_REMOVE_FROM_ARTICLE, articleId, tagId);
  },

  // ============= 搜索相关API =============
  searchArticles: (params) => {
    console.log('[Preload] 调用: searchArticles', params);
    return safeInvoke(IPC_CHANNELS.SEARCH_ARTICLES, params);
  },

  getSearchSuggestions: (keyword) => {
    console.log('[Preload] 调用: getSearchSuggestions', keyword);
    return safeInvoke(IPC_CHANNELS.SEARCH_SUGGESTIONS, keyword);
  },

  // ============= 统计相关API =============
  getStatistics: () => {
    console.log('[Preload] 调用: getStatistics');
    return safeInvoke(IPC_CHANNELS.STATS_GET);
  },

  // ============= 系统相关API =============
  getSystemPath: (name) => {
    console.log('[Preload] 调用: getSystemPath', name);
    return safeInvoke(IPC_CHANNELS.SYSTEM_GET_PATH, name);
  },

  openExternal: (url) => {
    console.log('[Preload] 调用: openExternal', url);
    return safeInvoke(IPC_CHANNELS.SYSTEM_OPEN_EXTERNAL, url);
  },
};

// ============= 使用contextBridge暴露API =============
try {
  contextBridge.exposeInMainWorld('api', api);
  console.log('[Preload] ✅ API成功暴露到渲染进程');
} catch (error) {
  console.error('[Preload] ❌ API暴露失败:', error);
}

// ============= 开发环境辅助 =============
if (process.env.NODE_ENV === 'development') {
  console.log('[Preload] 开发模式 - 已注册的API方法:', Object.keys(api));
  console.log('[Preload] 允许的IPC通道数量:', ALLOWED_CHANNELS.length);
}

// ============= 类型安全导出 =============
export type { IpcApi };
