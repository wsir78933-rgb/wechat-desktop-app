/**
 * 搜索相关IPC处理器
 * 处理文章搜索、搜索建议等功能
 */

import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../types/ipc';
import type { SearchParams, SearchResult, Statistics } from '../../types/ipc';

// 导入数据库操作模块 (待实现)
// import { SearchService } from '../services/search';
// import { StatisticsService } from '../services/statistics';

/**
 * 注册搜索相关的IPC处理器
 */
export function registerSearchHandlers() {
  // ============= 搜索文章 =============
  ipcMain.handle(
    IPC_CHANNELS.SEARCH_ARTICLES,
    async (_event, params: SearchParams): Promise<SearchResult> => {
      console.log('[IPC] 搜索文章:', params);

      try {
        // TODO: 实现搜索逻辑
        // const searchService = new SearchService();
        // const result = await searchService.search(params);

        // 模拟搜索结果
        const limit = params.limit || 20;
        const offset = params.offset || 0;

        // 模拟过滤逻辑
        let totalMatches = 35; // 模拟总匹配数

        if (params.tags && params.tags.length > 0) {
          totalMatches = Math.floor(totalMatches * 0.6);
        }

        if (params.author) {
          totalMatches = Math.floor(totalMatches * 0.4);
        }

        if (params.dateFrom || params.dateTo) {
          totalMatches = Math.floor(totalMatches * 0.7);
        }

        const mockArticles = Array.from(
          { length: Math.min(limit, Math.max(0, totalMatches - offset)) },
          (_, i) => ({
            id: i + 1 + offset,
            title: `${params.keyword ? `包含"${params.keyword}"的` : ''}文章 ${i + 1 + offset}`,
            author: params.author || '测试作者',
            publishDate: new Date(Date.now() - (i + offset) * 86400000).toISOString(),
            content: `文章内容，包含关键词: ${params.keyword}...`,
            url: `https://example.com/article/${i + 1 + offset}`,
            tags: params.tags || ['技术', 'AI'],
            readCount: Math.floor(Math.random() * 5000),
            likeCount: Math.floor(Math.random() * 500),
          })
        );

        return {
          articles: mockArticles,
          total: totalMatches,
          hasMore: offset + limit < totalMatches,
        };
      } catch (error) {
        console.error('[IPC] 搜索文章失败:', error);
        return {
          articles: [],
          total: 0,
          hasMore: false,
        };
      }
    }
  );

  // ============= 获取搜索建议 =============
  ipcMain.handle(
    IPC_CHANNELS.SEARCH_SUGGESTIONS,
    async (_event, keyword: string): Promise<string[]> => {
      console.log(`[IPC] 获取搜索建议: keyword=${keyword}`);

      try {
        if (!keyword || keyword.trim().length === 0) {
          return [];
        }

        // TODO: 实现搜索建议逻辑
        // const searchService = new SearchService();
        // return await searchService.getSuggestions(keyword);

        // 模拟搜索建议
        const suggestions = [
          'Electron开发',
          'Electron打包',
          'Electron IPC通信',
          'React Hooks',
          'React性能优化',
          'TypeScript类型',
          'TypeScript高级特性',
          'Vite构建',
          'Vite配置',
          'Node.js API',
        ];

        return suggestions.filter((s) => s.toLowerCase().includes(keyword.toLowerCase())).slice(0, 10);
      } catch (error) {
        console.error('[IPC] 获取搜索建议失败:', error);
        return [];
      }
    }
  );

  // ============= 获取统计信息 =============
  ipcMain.handle(IPC_CHANNELS.STATS_GET, async (): Promise<Statistics> => {
    console.log('[IPC] 获取统计信息');

    try {
      // TODO: 从数据库获取真实统计数据
      // const statsService = new StatisticsService();
      // return await statsService.getStatistics();

      // 模拟统计数据
      const now = new Date();
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - now.getDay());

      return {
        totalArticles: 328,
        totalTags: 25,
        totalAuthors: 12,
        articlesThisMonth: 45,
        articlesThisWeek: 12,
        topTags: [
          { name: '技术', count: 85 },
          { name: 'AI', count: 67 },
          { name: '产品', count: 52 },
          { name: '设计', count: 43 },
          { name: '运营', count: 31 },
          { name: 'React', count: 28 },
          { name: 'Electron', count: 22 },
          { name: 'Node.js', count: 18 },
          { name: 'TypeScript', count: 15 },
          { name: 'Vite', count: 12 },
        ],
        topAuthors: [
          { name: '张三', count: 45 },
          { name: '李四', count: 38 },
          { name: '王五', count: 32 },
          { name: '赵六', count: 28 },
          { name: '钱七', count: 24 },
          { name: '孙八', count: 19 },
          { name: '周九', count: 15 },
          { name: '吴十', count: 12 },
        ],
      };
    } catch (error) {
      console.error('[IPC] 获取统计信息失败:', error);
      return {
        totalArticles: 0,
        totalTags: 0,
        totalAuthors: 0,
        articlesThisMonth: 0,
        articlesThisWeek: 0,
        topTags: [],
        topAuthors: [],
      };
    }
  });

  console.log('[IPC] 搜索处理器注册完成');
}

/**
 * 清理搜索相关的IPC处理器
 */
export function unregisterSearchHandlers() {
  ipcMain.removeHandler(IPC_CHANNELS.SEARCH_ARTICLES);
  ipcMain.removeHandler(IPC_CHANNELS.SEARCH_SUGGESTIONS);
  ipcMain.removeHandler(IPC_CHANNELS.STATS_GET);

  console.log('[IPC] 搜索处理器已清理');
}
