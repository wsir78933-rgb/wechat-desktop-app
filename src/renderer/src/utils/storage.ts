/**
 * localStorage封装工具
 */

const STORAGE_PREFIX = 'wechat_app_';

/**
 * 获取完整的存储键名
 * @param key 键名
 * @returns 带前缀的键名
 */
function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * 存储数据到localStorage
 * @param key 键名
 * @param value 值（会自动序列化）
 */
export function setItem<T = any>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(getStorageKey(key), serialized);
  } catch (error) {
    console.error('存储数据失败:', error);
  }
}

/**
 * 从localStorage获取数据
 * @param key 键名
 * @param defaultValue 默认值
 * @returns 存储的值或默认值
 */
export function getItem<T = any>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(getStorageKey(key));
    if (item === null) {
      return defaultValue !== undefined ? defaultValue : null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error('读取数据失败:', error);
    return defaultValue !== undefined ? defaultValue : null;
  }
}

/**
 * 从localStorage删除数据
 * @param key 键名
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(getStorageKey(key));
  } catch (error) {
    console.error('删除数据失败:', error);
  }
}

/**
 * 清空所有应用相关的localStorage数据
 */
export function clear(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('清空数据失败:', error);
  }
}

/**
 * 检查localStorage中是否存在某个键
 * @param key 键名
 * @returns 是否存在
 */
export function hasItem(key: string): boolean {
  return localStorage.getItem(getStorageKey(key)) !== null;
}

/**
 * 获取所有应用相关的localStorage键名
 * @returns 键名数组（不含前缀）
 */
export function getAllKeys(): string[] {
  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .map((key) => key.substring(STORAGE_PREFIX.length));
  } catch (error) {
    console.error('获取键名失败:', error);
    return [];
  }
}

/**
 * 获取localStorage的使用情况
 * @returns 使用情况对象
 */
export function getStorageInfo(): {
  used: number;
  total: number;
  percentage: number;
} {
  try {
    let used = 0;
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    });

    // localStorage通常限制为5MB
    const total = 5 * 1024 * 1024;
    const percentage = (used / total) * 100;

    return {
      used,
      total,
      percentage: Math.round(percentage * 100) / 100,
    };
  } catch (error) {
    console.error('获取存储信息失败:', error);
    return { used: 0, total: 0, percentage: 0 };
  }
}

/**
 * 带过期时间的存储
 * @param key 键名
 * @param value 值
 * @param ttl 过期时间（毫秒）
 */
export function setItemWithExpiry<T = any>(key: string, value: T, ttl: number): void {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  setItem(key, item);
}

/**
 * 获取带过期时间的存储数据
 * @param key 键名
 * @returns 存储的值或null（如果已过期或不存在）
 */
export function getItemWithExpiry<T = any>(key: string): T | null {
  const item = getItem<{ value: T; expiry: number }>(key);

  if (!item) {
    return null;
  }

  const now = new Date();
  if (now.getTime() > item.expiry) {
    removeItem(key);
    return null;
  }

  return item.value;
}
