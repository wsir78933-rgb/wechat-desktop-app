/**
 * URL验证工具函数（微信公众号文章）
 */

/**
 * 验证是否为有效的URL
 * @param url URL字符串
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证是否为微信公众号文章URL
 * @param url URL字符串
 * @returns 是否为微信公众号文章
 */
export function isWechatArticleUrl(url: string): boolean {
  if (!isValidUrl(url)) {
    return false;
  }

  const wechatPatterns = [
    /mp\.weixin\.qq\.com\/s/i,
    /mp\.weixin\.qq\.com\/s\?/i,
    /weixin\.qq\.com\/r\//i,
  ];

  return wechatPatterns.some((pattern) => pattern.test(url));
}

/**
 * 验证URL并返回错误信息
 * @param url URL字符串
 * @returns 错误信息，如果有效则返回null
 */
export function validateUrl(url: string): string | null {
  if (!url || url.trim() === '') {
    return '请输入URL';
  }

  if (!isValidUrl(url)) {
    return '请输入有效的URL地址';
  }

  if (!isWechatArticleUrl(url)) {
    return '请输入有效的微信公众号文章链接';
  }

  return null;
}

/**
 * 清理URL参数（保留核心参数）
 * @param url URL字符串
 * @returns 清理后的URL
 */
export function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // 微信文章URL通常只需要保留__biz, mid, idx, sn等核心参数
    if (isWechatArticleUrl(url)) {
      const importantParams = ['__biz', 'mid', 'idx', 'sn', 'chksm'];
      const newParams = new URLSearchParams();

      importantParams.forEach((param) => {
        const value = urlObj.searchParams.get(param);
        if (value) {
          newParams.set(param, value);
        }
      });

      urlObj.search = newParams.toString();
    }

    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * 从URL中提取文章ID
 * @param url 微信文章URL
 * @returns 文章ID或null
 */
export function extractArticleId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const mid = urlObj.searchParams.get('mid');
    const idx = urlObj.searchParams.get('idx');
    const sn = urlObj.searchParams.get('sn');

    if (sn) {
      return sn; // sn是最稳定的唯一标识
    } else if (mid && idx) {
      return `${mid}_${idx}`;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 检查URL是否可访问（仅检查格式，不发起网络请求）
 * @param url URL字符串
 * @returns 是否可能可访问
 */
export function isProbablyAccessible(url: string): boolean {
  if (!isValidUrl(url)) {
    return false;
  }

  try {
    const urlObj = new URL(url);

    // 检查协议
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }

    // 检查是否有主机名
    if (!urlObj.hostname) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * 格式化URL显示（截断过长的URL）
 * @param url URL字符串
 * @param maxLength 最大长度
 * @returns 格式化后的URL
 */
export function formatUrlDisplay(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) {
    return url;
  }

  const start = url.substring(0, maxLength - 10);
  const end = url.substring(url.length - 7);
  return `${start}...${end}`;
}
