/**
 * IPC通信类型定义
 * 定义主进程和渲染进程之间的通信接口
 */

// ============= 文章相关类型 =============
export interface Article {
  id?: number;
  title: string;
  author: string;
  publishDate: string;
  content: string;
  url: string;
  tags: string[];
  category?: string;
  readCount?: number;
  likeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScrapeParams {
  url: string;
  accountName: string;
  startDate?: string;
  endDate?: string;
  maxArticles?: number;
}

export interface ScrapeProgress {
  current: number;
  total: number;
  currentArticle: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface ScrapeResult {
  success: boolean;
  articles: Article[];
  total: number;
  error?: string;
}

// ============= 标签相关类型 =============
export interface Tag {
  id?: number;
  name: string;
  color?: string;
  count?: number;
  createdAt?: string;
}

export interface TagOperationResult {
  success: boolean;
  message?: string;
  tag?: Tag;
}

// ============= 搜索相关类型 =============
export interface SearchParams {
  keyword: string;
  tags?: string[];
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  articles: Article[];
  total: number;
  hasMore: boolean;
}

// ============= 导出相关类型 =============
export type ExportFormat = 'markdown' | 'html' | 'pdf' | 'json';

export interface ExportParams {
  articleIds: number[];
  format: ExportFormat;
  outputPath: string;
  includeImages?: boolean;
  includeMeta?: boolean;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

// ============= 统计相关类型 =============
export interface Statistics {
  totalArticles: number;
  totalTags: number;
  totalAuthors: number;
  articlesThisMonth: number;
  articlesThisWeek: number;
  topTags: Array<{ name: string; count: number }>;
  topAuthors: Array<{ name: string; count: number }>;
}

// ============= 窗口相关类型 =============
export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowBounds extends WindowPosition, WindowSize {}

export type WindowType = 'main' | 'float';

// ============= IPC通道定义 =============
export const IPC_CHANNELS = {
  // 文章相关
  ARTICLE_SCRAPE: 'article:scrape',
  ARTICLE_GET_ALL: 'article:getAll',
  ARTICLE_GET_BY_ID: 'article:getById',
  ARTICLE_DELETE: 'article:delete',
  ARTICLE_UPDATE: 'article:update',
  ARTICLE_EXPORT: 'article:export',
  ARTICLE_SCRAPE_PROGRESS: 'article:scrape:progress',

  // 标签相关
  TAG_GET_ALL: 'tag:getAll',
  TAG_CREATE: 'tag:create',
  TAG_UPDATE: 'tag:update',
  TAG_DELETE: 'tag:delete',
  TAG_ADD_TO_ARTICLE: 'tag:addToArticle',
  TAG_REMOVE_FROM_ARTICLE: 'tag:removeFromArticle',

  // 搜索相关
  SEARCH_ARTICLES: 'search:articles',
  SEARCH_SUGGESTIONS: 'search:suggestions',

  // 统计相关
  STATS_GET: 'stats:get',

  // 系统相关
  SYSTEM_GET_PATH: 'system:getPath',
  SYSTEM_OPEN_EXTERNAL: 'system:openExternal',

  // 窗口相关
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_TOGGLE_ALWAYS_ON_TOP: 'window:toggleAlwaysOnTop',
  WINDOW_GET_POSITION: 'window:getPosition',
  WINDOW_SET_POSITION: 'window:setPosition',
  WINDOW_GET_SIZE: 'window:getSize',
  WINDOW_SET_SIZE: 'window:setSize',
  WINDOW_OPEN_MAIN: 'window:openMain',
  WINDOW_SHOW_FLOAT: 'window:showFloat',
  WINDOW_HIDE_FLOAT: 'window:hideFloat',
  WINDOW_TOGGLE_FLOAT: 'window:toggleFloat',
} as const;

// ============= IPC API接口定义 =============
export interface IpcApi {
  // 文章相关
  scrapeArticles: (params: ScrapeParams) => Promise<ScrapeResult>;
  getAllArticles: (limit?: number, offset?: number) => Promise<Article[]>;
  getArticleById: (id: number) => Promise<Article | null>;
  deleteArticle: (id: number) => Promise<boolean>;
  updateArticle: (id: number, article: Partial<Article>) => Promise<boolean>;
  exportArticles: (params: ExportParams) => Promise<ExportResult>;
  onScrapeProgress: (callback: (progress: ScrapeProgress) => void) => void;

  // 标签相关
  getAllTags: () => Promise<Tag[]>;
  createTag: (name: string, color?: string) => Promise<TagOperationResult>;
  updateTag: (id: number, name: string, color?: string) => Promise<TagOperationResult>;
  deleteTag: (id: number) => Promise<boolean>;
  addTagToArticle: (articleId: number, tagId: number) => Promise<boolean>;
  removeTagFromArticle: (articleId: number, tagId: number) => Promise<boolean>;

  // 搜索相关
  searchArticles: (params: SearchParams) => Promise<SearchResult>;
  getSearchSuggestions: (keyword: string) => Promise<string[]>;

  // 统计相关
  getStatistics: () => Promise<Statistics>;

  // 系统相关
  getSystemPath: (name: string) => Promise<string>;
  openExternal: (url: string) => Promise<void>;

  // 窗口相关
  window: {
    minimize: (windowType?: WindowType) => Promise<void>;
    close: (windowType?: WindowType) => Promise<void>;
    toggleAlwaysOnTop: (windowType?: WindowType) => Promise<boolean>;
    getPosition: (windowType?: WindowType) => Promise<WindowPosition>;
    setPosition: (windowType: WindowType, x: number, y: number) => Promise<void>;
    getSize: (windowType?: WindowType) => Promise<WindowSize>;
    setSize: (windowType: WindowType, width: number, height: number) => Promise<void>;
    openMain: (articleId?: number) => Promise<void>;
    showFloat: () => Promise<void>;
    hideFloat: () => Promise<void>;
    toggleFloat: () => Promise<void>;
  };
}

// 扩展Window接口 - 主窗口版本
// 注意：悬浮窗使用不同的类型定义（见 src/renderer/src/types/index.ts）
declare global {
  interface Window {
    api: IpcApi | import('../renderer/src/types').WindowAPI;
  }
}
