/**
 * 标签相关类型定义
 * 与 src/types/ipc.ts 保持一致
 */

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

/**
 * 标签层级结构（用于标签管理界面）
 */
export interface TagHierarchy {
  id: number;
  name: string;
  color: string;
  count: number;
  children?: TagHierarchy[];
  parent?: number;
}

/**
 * 标签筛选参数
 */
export interface TagFilterParams {
  searchKeyword?: string;
  sortBy?: 'name' | 'count' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  colorFilter?: string[];
}

/**
 * 预定义标签颜色
 */
export const TAG_COLORS = {
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

export type TagColorKey = keyof typeof TAG_COLORS;

/**
 * 标签颜色名称映射（中文）
 */
export const TAG_COLOR_NAMES: Record<TagColorKey, string> = {
  red: '红色',
  orange: '橙色',
  yellow: '黄色',
  green: '绿色',
  blue: '蓝色',
  indigo: '靛蓝',
  purple: '紫色',
  pink: '粉色',
  gray: '灰色',
  slate: '石板色',
};
