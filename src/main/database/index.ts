/**
 * 数据库模块入口
 * 统一导出所有数据库服务和类型
 */

// 数据库连接管理
export {
  initDatabase,
  getDatabase,
  closeDatabase,
  runTransaction,
  backupDatabase,
  optimizeDatabase,
} from './db';

// 文章服务
export { default as articleService } from './articleService';
export type {
  Article,
  QueryOptions,
  PaginatedResult,
} from './articleService';

// 标签服务
export { default as tagService } from './tagService';
export type {
  Tag,
  TagStats,
} from './tagService';

// 搜索服务
export { default as searchService } from './searchService';
export type {
  SearchOptions,
  SearchResult,
  SearchSuggestion,
} from './searchService';
