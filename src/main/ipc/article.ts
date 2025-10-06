/**
 * 文章相关IPC处理器
 * 处理文章采集、查询、更新、删除、导出等操作
 */

import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../types/ipc';
import type {
  ScrapeParams,
  ScrapeResult,
  Article,
  ExportParams,
  ExportResult,
  ScrapeProgress,
} from '../../types/ipc';

// 导入数据库操作模块 (待实现)
// import { ArticleDatabase } from '../database/article';
import { WechatScraper } from '../scrapers/wechat';
// import { ArticleExporter } from '../utils/exporter';

/**
 * 注册文章相关的IPC处理器
 */
export function registerArticleHandlers() {
  // ============= 文章采集 =============
  ipcMain.handle(IPC_CHANNELS.ARTICLE_SCRAPE, async (_event, params: ScrapeParams): Promise<ScrapeResult> => {
    console.log('[IPC] 开始采集文章:', params);

    try {
      const mainWindow = BrowserWindow.getAllWindows()[0];

      // 发送采集进度
      const sendProgress = (progress: ScrapeProgress) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send(IPC_CHANNELS.ARTICLE_SCRAPE_PROGRESS, progress);
        }
      };

      // 获取URL列表（ScrapeParams只有单个url）
      const urls = [params.url];
      const articles: Article[] = [];

      sendProgress({
        current: 0,
        total: urls.length,
        currentArticle: '正在初始化爬虫...',
        status: 'processing',
      });

      const scraper = new WechatScraper();

      // 遍历所有URL进行采集
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];

        sendProgress({
          current: i,
          total: urls.length,
          currentArticle: `正在抓取第 ${i + 1}/${urls.length} 篇文章...`,
          status: 'processing',
        });

        try {
          const scrapeResult = await scraper.scrapeArticle(url);

          if (scrapeResult.success && scrapeResult.data) {
            // 转换爬虫数据格式为应用数据格式
            const article: Article = {
              id: Date.now() + i,
              title: scrapeResult.data.title,
              author: scrapeResult.data.author || params.accountName || '未知作者',
              publishDate: scrapeResult.data.publishTime,
              content: scrapeResult.data.content || scrapeResult.data.summary,
              url: scrapeResult.data.url,
              tags: ['公众号'],
            };

            articles.push(article);
            console.log(`[IPC] ✅ 文章采集成功: ${article.title}`);
          } else {
            console.error(`[IPC] ❌ 文章采集失败: ${url}`, scrapeResult.error);
          }
        } catch (error) {
          console.error(`[IPC] ❌ 文章采集异常: ${url}`, error);
        }
      }

      // TODO: 保存到数据库
      // const db = new ArticleDatabase();
      // await db.batchInsert(articles);

      sendProgress({
        current: urls.length,
        total: urls.length,
        currentArticle: `采集完成，成功 ${articles.length}/${urls.length} 篇`,
        status: 'completed',
      });

      return {
        success: articles.length > 0,
        articles: articles,
        total: articles.length,
        error: articles.length === 0 ? '所有文章采集失败' : undefined,
      };
    } catch (error) {
      console.error('[IPC] 文章采集失败:', error);
      return {
        success: false,
        articles: [],
        total: 0,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  });

  // ============= 获取所有文章 =============
  ipcMain.handle(
    IPC_CHANNELS.ARTICLE_GET_ALL,
    async (_event, limit = 50, offset = 0): Promise<Article[]> => {
      console.log(`[IPC] 获取文章列表: limit=${limit}, offset=${offset}`);

      try {
        // TODO: 从数据库查询
        // const db = new ArticleDatabase();
        // return await db.getAll(limit, offset);

        // 模拟数据
        return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
          id: i + 1 + offset,
          title: `文章标题 ${i + 1 + offset}`,
          author: '测试作者',
          publishDate: new Date(Date.now() - i * 86400000).toISOString(),
          content: `文章内容 ${i + 1}`,
          url: `https://example.com/article/${i + 1}`,
          tags: ['技术', 'AI'],
          readCount: Math.floor(Math.random() * 10000),
          likeCount: Math.floor(Math.random() * 1000),
        }));
      } catch (error) {
        console.error('[IPC] 获取文章列表失败:', error);
        return [];
      }
    }
  );

  // ============= 根据ID获取文章 =============
  ipcMain.handle(
    IPC_CHANNELS.ARTICLE_GET_BY_ID,
    async (_event, id: number): Promise<Article | null> => {
      console.log(`[IPC] 获取文章详情: id=${id}`);

      try {
        // TODO: 从数据库查询
        // const db = new ArticleDatabase();
        // return await db.getById(id);

        // 模拟数据
        return {
          id,
          title: `文章标题 ${id}`,
          author: '测试作者',
          publishDate: new Date().toISOString(),
          content: `这是文章 ${id} 的完整内容...`,
          url: `https://example.com/article/${id}`,
          tags: ['技术', 'Electron'],
          readCount: 1234,
          likeCount: 56,
        };
      } catch (error) {
        console.error('[IPC] 获取文章详情失败:', error);
        return null;
      }
    }
  );

  // ============= 删除文章 =============
  ipcMain.handle(IPC_CHANNELS.ARTICLE_DELETE, async (_event, id: number): Promise<boolean> => {
    console.log(`[IPC] 删除文章: id=${id}`);

    try {
      // TODO: 从数据库删除
      // const db = new ArticleDatabase();
      // return await db.delete(id);

      return true;
    } catch (error) {
      console.error('[IPC] 删除文章失败:', error);
      return false;
    }
  });

  // ============= 更新文章 =============
  ipcMain.handle(
    IPC_CHANNELS.ARTICLE_UPDATE,
    async (_event, id: number, article: Partial<Article>): Promise<boolean> => {
      console.log(`[IPC] 更新文章: id=${id}`, article);

      try {
        // TODO: 更新数据库
        // const db = new ArticleDatabase();
        // return await db.update(id, article);

        return true;
      } catch (error) {
        console.error('[IPC] 更新文章失败:', error);
        return false;
      }
    }
  );

  // ============= 导出文章 =============
  ipcMain.handle(
    IPC_CHANNELS.ARTICLE_EXPORT,
    async (_event, params: ExportParams): Promise<ExportResult> => {
      console.log('[IPC] 导出文章:', params);

      try {
        // TODO: 实现导出功能
        // const exporter = new ArticleExporter();
        // const filePath = await exporter.export(params);

        return {
          success: true,
          filePath: params.outputPath,
        };
      } catch (error) {
        console.error('[IPC] 导出文章失败:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '导出失败',
        };
      }
    }
  );

  console.log('[IPC] 文章处理器注册完成');
}

/**
 * 清理文章相关的IPC处理器
 */
export function unregisterArticleHandlers() {
  ipcMain.removeHandler(IPC_CHANNELS.ARTICLE_SCRAPE);
  ipcMain.removeHandler(IPC_CHANNELS.ARTICLE_GET_ALL);
  ipcMain.removeHandler(IPC_CHANNELS.ARTICLE_GET_BY_ID);
  ipcMain.removeHandler(IPC_CHANNELS.ARTICLE_DELETE);
  ipcMain.removeHandler(IPC_CHANNELS.ARTICLE_UPDATE);
  ipcMain.removeHandler(IPC_CHANNELS.ARTICLE_EXPORT);

  console.log('[IPC] 文章处理器已清理');
}
