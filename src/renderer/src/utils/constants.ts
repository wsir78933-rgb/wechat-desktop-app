/**
 * 应用常量定义
 */

/**
 * 日期格式常量
 */
export const DATE_FORMATS = {
  FULL: 'full',
  DATE: 'date',
  TIME: 'time',
  DATETIME: 'datetime',
  RELATIVE: 'relative',
} as const;

/**
 * 默认分页配置
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Toast消息持续时间（毫秒）
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;

/**
 * 防抖延迟时间（毫秒）
 */
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 200,
  SCROLL: 100,
} as const;

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  RECENT_SEARCHES: 'recent_searches',
  WINDOW_POSITION: 'window_position',
  THEME: 'theme',
  LANGUAGE: 'language',
  ARTICLE_FILTERS: 'article_filters',
  TAG_COLORS: 'tag_colors',
} as const;

/**
 * 文章导出格式
 */
export const EXPORT_FORMATS = {
  MARKDOWN: 'markdown',
  HTML: 'html',
  PDF: 'pdf',
  JSON: 'json',
} as const;

/**
 * 文章排序字段
 */
export const SORT_FIELDS = {
  PUBLISH_DATE: 'publishDate',
  CREATED_AT: 'createdAt',
  TITLE: 'title',
  AUTHOR: 'author',
} as const;

/**
 * 排序顺序
 */
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

/**
 * 组件尺寸
 */
export const COMPONENT_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
} as const;

/**
 * 按钮变体
 */
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
  GHOST: 'ghost',
  OUTLINE: 'outline',
} as const;

/**
 * Toast消息类型
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

/**
 * 模态框宽度
 */
export const MODAL_WIDTHS = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
} as const;

/**
 * 采集状态
 */
export const SCRAPE_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

/**
 * 微信文章URL正则表达式
 */
export const WECHAT_URL_PATTERN = /mp\.weixin\.qq\.com\/s/i;

/**
 * 最大文章采集数量
 */
export const MAX_ARTICLES_PER_SCRAPE = 100;

/**
 * 搜索建议最大数量
 */
export const MAX_SEARCH_SUGGESTIONS = 10;

/**
 * 最近搜索记录最大数量
 */
export const MAX_RECENT_SEARCHES = 20;

/**
 * 标签颜色预设（与tag.ts中的TAG_COLORS保持一致）
 */
export const TAG_COLOR_PRESETS = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#a855f7',
  pink: '#ec4899',
  gray: '#6b7280',
  slate: '#64748b',
} as const;

/**
 * 图表类型
 */
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  AREA: 'area',
} as const;

/**
 * 默认图表高度
 */
export const DEFAULT_CHART_HEIGHT = 300;

/**
 * 应用主题色
 */
export const THEME_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#22c55e',
  WARNING: '#eab308',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
} as const;

/**
 * Z-index层级
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

/**
 * 动画持续时间（毫秒）
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * 正则表达式常量
 */
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  WECHAT_ARTICLE: /mp\.weixin\.qq\.com\/s/i,
} as const;

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络错误，请检查网络连接',
  INVALID_URL: '无效的URL地址',
  INVALID_WECHAT_URL: '请输入有效的微信公众号文章链接',
  SCRAPE_FAILED: '文章采集失败',
  SAVE_FAILED: '保存失败',
  DELETE_FAILED: '删除失败',
  EXPORT_FAILED: '导出失败',
  LOAD_FAILED: '加载失败',
} as const;

/**
 * 成功消息
 */
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  EXPORT_SUCCESS: '导出成功',
  SCRAPE_SUCCESS: '采集成功',
  UPDATE_SUCCESS: '更新成功',
} as const;
