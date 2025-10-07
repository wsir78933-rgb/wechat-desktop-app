/**
 * 微信公众号文章抓取器
 * 功能：抓取微信公众号文章内容
 */

import { net } from 'electron';
import * as cheerio from 'cheerio';

/**
 * 文章数据接口
 */
export interface ArticleData {
  title: string;
  author: string;
  publishTime: string;
  coverImage: string;
  summary: string;
  content?: string;
  url: string;
}

/**
 * 抓取结果接口
 */
export interface ScrapeResult {
  success: boolean;
  data?: ArticleData;
  error?: string;
  retryCount?: number;
}

/**
 * 抓取配置
 */
interface ScrapeConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  requestInterval: number;
}

/**
 * 随机 User-Agent 池
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

/**
 * 获取随机 User-Agent
 */
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 提取文章摘要（前200字）
 */
function extractSummary(text: string): string {
  // 移除多余的空白字符
  const cleanText = text.replace(/\s+/g, ' ').trim();
  // 截取前200个字符
  return cleanText.length > 200 ? cleanText.substring(0, 200) + '...' : cleanText;
}

/**
 * 解析微信公众号文章HTML
 */
function parseWechatArticle(html: string, url: string): ArticleData | null {
  try {
    const $ = cheerio.load(html);

    // 提取标题
    const title = $('#activity-name').text().trim() ||
                  $('h1.rich_media_title').text().trim() ||
                  $('h2.rich_media_title').text().trim() ||
                  '';

    // 提取作者
    const author = $('#js_name').text().trim() ||
                   $('.rich_media_meta_text').first().text().trim() ||
                   $('a.rich_media_meta_link').text().trim() ||
                   '未知作者';

    // 提取发布时间
    const publishTime = $('#publish_time').text().trim() ||
                        $('.rich_media_meta_text').eq(1).text().trim() ||
                        new Date().toISOString();

    // 提取封面图
    let coverImage = '';
    const msgCdnUrl = $('#js_cover').attr('src') ||
                      $('.rich_media_thumb').attr('src') ||
                      $('img').first().attr('src') ||
                      '';
    coverImage = msgCdnUrl;

    // 提取正文内容
    const contentElement = $('#js_content') || $('.rich_media_content');
    let content = contentElement.text().trim();

    // 提取摘要
    const summary = extractSummary(content);

    // 验证必要字段
    if (!title) {
      console.warn('文章标题为空，可能解析失败');
      return null;
    }

    return {
      title,
      author,
      publishTime,
      coverImage,
      summary,
      content,
      url
    };
  } catch (error) {
    console.error('解析文章HTML失败:', error);
    return null;
  }
}

/**
 * 微信公众号文章抓取器类
 */
export class WechatScraper {
  private config: ScrapeConfig;
  private lastRequestTime: number = 0;

  constructor(config?: Partial<ScrapeConfig>) {
    this.config = {
      maxRetries: 3,
      retryDelay: 2000,
      timeout: 10000,
      requestInterval: 2000,
      ...config
    };
  }

  /**
   * 确保请求间隔
   */
  private async ensureRequestInterval(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.config.requestInterval) {
      const waitTime = this.config.requestInterval - timeSinceLastRequest;
      await delay(waitTime);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * 发送HTTP请求（带重试机制）
   */
  private async fetchWithRetry(url: string, retryCount: number = 0): Promise<string> {
    try {
      // 确保请求间隔
      await this.ensureRequestInterval();

      // 使用 Electron net 模块发送请求
      const request = net.request({
        method: 'GET',
        url: url,
        redirect: 'follow'
      });

      // 设置请求头
      request.setHeader('User-Agent', getRandomUserAgent());
      request.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
      request.setHeader('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8');
      request.setHeader('Connection', 'keep-alive');

      // 返回 Promise
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        request.on('response', (response) => {
          const statusCode = response.statusCode;

          if (statusCode < 200 || statusCode >= 400) {
            reject(new Error(`HTTP ${statusCode}`));
            return;
          }

          response.on('data', (chunk) => {
            chunks.push(Buffer.from(chunk));
          });

          response.on('end', () => {
            const html = Buffer.concat(chunks).toString('utf-8');
            resolve(html);
          });

          response.on('error', (error: Error) => {
            reject(error);
          });
        });

        request.on('error', (error: Error) => {
          reject(error);
        });

        // 设置超时
        setTimeout(() => {
          request.abort();
          reject(new Error('请求超时'));
        }, this.config.timeout);

        request.end();
      });

    } catch (error: any) {
      // 判断是否需要重试
      if (retryCount < this.config.maxRetries) {
        console.warn(`请求失败，正在进行第 ${retryCount + 1} 次重试...`);
        await delay(this.config.retryDelay * (retryCount + 1)); // 指数退避
        return this.fetchWithRetry(url, retryCount + 1);
      }

      // 重试次数用尽，抛出错误
      throw new Error(`请求失败: ${error.message}`);
    }
  }

  /**
   * 抓取微信公众号文章
   * @param url 文章URL
   * @returns 抓取结果
   */
  public async scrapeArticle(url: string): Promise<ScrapeResult> {
    let retryCount = 0;

    try {
      // 验证URL格式
      if (!url || !url.includes('mp.weixin.qq.com')) {
        return {
          success: false,
          error: '无效的微信公众号文章URL'
        };
      }

      console.log(`开始抓取文章: ${url}`);

      // 获取HTML内容
      const html = await this.fetchWithRetry(url);

      // 解析文章
      const article = parseWechatArticle(html, url);

      if (!article) {
        return {
          success: false,
          error: '文章解析失败，可能是HTML结构不匹配'
        };
      }

      console.log(`文章抓取成功: ${article.title}`);

      return {
        success: true,
        data: article,
        retryCount
      };

    } catch (error: any) {
      console.error('抓取文章失败:', error);

      return {
        success: false,
        error: error.message || '未知错误',
        retryCount
      };
    }
  }

  /**
   * 批量抓取文章
   * @param urls 文章URL数组
   * @returns 抓取结果数组
   */
  public async scrapeMultipleArticles(urls: string[]): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = [];

    for (const url of urls) {
      try {
        const result = await this.scrapeArticle(url);
        results.push(result);
      } catch (error: any) {
        results.push({
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<ScrapeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  public getConfig(): ScrapeConfig {
    return { ...this.config };
  }
}

/**
 * 导出默认实例
 */
export const wechatScraper = new WechatScraper();

/**
 * 便捷函数：抓取单篇文章
 */
export async function scrapeWechatArticle(url: string): Promise<ScrapeResult> {
  return wechatScraper.scrapeArticle(url);
}

/**
 * 便捷函数：批量抓取文章
 */
export async function scrapeMultipleWechatArticles(urls: string[]): Promise<ScrapeResult[]> {
  return wechatScraper.scrapeMultipleArticles(urls);
}
