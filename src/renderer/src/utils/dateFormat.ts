/**
 * 日期格式化工具函数（中文）
 */

/**
 * 格式化日期为中文格式
 * @param date 日期字符串或Date对象
 * @param format 格式化模板
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: string | Date,
  format: 'full' | 'date' | 'time' | 'datetime' | 'relative' = 'datetime'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return '无效日期';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'full':
      return `${year}年${parseInt(month)}月${parseInt(day)}日 ${hours}:${minutes}:${seconds}`;
    case 'date':
      return `${year}年${parseInt(month)}月${parseInt(day)}日`;
    case 'time':
      return `${hours}:${minutes}:${seconds}`;
    case 'datetime':
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case 'relative':
      return formatRelativeTime(d);
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}

/**
 * 格式化相对时间（如：刚刚、5分钟前、今天、昨天等）
 * @param date 日期对象或字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days === 1) {
    return '昨天';
  } else if (days === 2) {
    return '前天';
  } else if (days < 7) {
    return `${days}天前`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks}周前`;
  } else if (months < 12) {
    return `${months}个月前`;
  } else {
    return `${years}年前`;
  }
}

/**
 * 获取今天的日期范围
 * @returns 今天的开始和结束时间
 */
export function getTodayRange(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * 获取本周的日期范围
 * @returns 本周的开始和结束时间
 */
export function getWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * 获取本月的日期范围
 * @returns 本月的开始和结束时间
 */
export function getMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * 获取星期几的中文名称
 * @param date 日期对象或字符串
 * @returns 星期几的中文名称
 */
export function getWeekdayName(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekdays[d.getDay()];
}

/**
 * 判断是否为今天
 * @param date 日期对象或字符串
 * @returns 是否为今天
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * 判断是否为本周
 * @param date 日期对象或字符串
 * @returns 是否为本周
 */
export function isThisWeek(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const { start, end } = getWeekRange();
  return d >= start && d <= end;
}

/**
 * 判断是否为本月
 * @param date 日期对象或字符串
 * @returns 是否为本月
 */
export function isThisMonth(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}
