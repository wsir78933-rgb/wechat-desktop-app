/**
 * 抓取器模块导出
 */

export {
  WechatScraper,
  wechatScraper,
  scrapeWechatArticle,
  scrapeMultipleWechatArticles
} from './wechat';

export type {
  ArticleData,
  ScrapeResult
} from './wechat';

export {
  ScrapeStatus,
  ScraperError
} from './types';

export type {
  ScrapeStats
} from './types';
