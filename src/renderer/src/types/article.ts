/**
 * 文章相关类型定义
 * 与 src/types/ipc.ts 保持一致
 */

/**
 * 文章数据结构
 */
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

/**
 * 文章采集参数
 */
export interface ScrapeParams {
  url: string;
  accountName: string;
  startDate?: string;
  endDate?: string;
  maxArticles?: number;
}

/**
 * 采集进度
 */
export interface ScrapeProgress {
  current: number;
  total: number;
  currentArticle: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

/**
 * 采集结果
 */
export interface ScrapeResult {
  success: boolean;
  articles: Article[];
  total: number;
  error?: string;
}

/**
 * 搜索参数
 */
export interface SearchParams {
  keyword: string;
  tags?: string[];
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  articles: Article[];
  total: number;
  hasMore: boolean;
}

/**
 * 导出格式
 */
export type ExportFormat = 'markdown' | 'html' | 'pdf' | 'json';

/**
 * 导出参数
 */
export interface ExportParams {
  articleIds: number[];
  format: ExportFormat;
  outputPath: string;
  includeImages?: boolean;
  includeMeta?: boolean;
}

/**
 * 导出结果
 */
export interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * 统计数据
 */
export interface Statistics {
  totalArticles: number;
  totalTags: number;
  totalAuthors: number;
  articlesThisMonth: number;
  articlesThisWeek: number;
  topTags: Array<{ name: string; count: number }>;
  topAuthors: Array<{ name: string; count: number }>;
}

/**
 * 文章筛选参数（UI用）
 */
export interface ArticleFilter {
  keyword: string;
  accountName?: string;
  tags: string[];
  isFavorite?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * 排序选项
 */
export interface SortOption {
  field: 'publishDate' | 'createdAt' | 'title';
  order: 'asc' | 'desc';
}

/**
 * 分页状态
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
