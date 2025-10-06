/**
 * 抓取器模块类型定义
 */

/**
 * 抓取状态枚举
 */
export enum ScrapeStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  RETRY = 'retry',
  INVALID_URL = 'invalid_url'
}

/**
 * 抓取器错误类型
 */
export class ScraperError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ScraperError';
  }
}

/**
 * 抓取统计信息
 */
export interface ScrapeStats {
  totalRequests: number;
  successCount: number;
  failedCount: number;
  retryCount: number;
  averageResponseTime: number;
}
