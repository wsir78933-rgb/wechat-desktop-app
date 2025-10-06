import { getDatabase } from './db';
import type { Database } from 'better-sqlite3';
import type { Article, PaginatedResult } from './articleService';

/**
 * 搜索选项接口
 */
export interface SearchOptions {
  query: string;                          // 搜索关键词
  page?: number;                          // 页码
  pageSize?: number;                      // 每页数量
  fields?: ('title' | 'author' | 'content' | 'summary')[];  // 搜索字段
  is_favorite?: number;                   // 只搜索收藏
  is_archived?: number;                   // 只搜索归档
  public_account?: string;                // 限定公众号
  tag?: string;                           // 限定标签
  dateFrom?: number;                      // 开始日期（Unix时间戳）
  dateTo?: number;                        // 结束日期（Unix时间戳）
}

/**
 * 搜索结果接口（带高亮片段）
 */
export interface SearchResult extends Article {
  snippet?: string;                       // 匹配的内容片段
  rank?: number;                          // 相关性排名
}

/**
 * 搜索建议接口
 */
export interface SearchSuggestion {
  text: string;                           // 建议文本
  count: number;                          // 匹配数量
  type: 'title' | 'author' | 'account' | 'tag';  // 建议类型
}

/**
 * 全文搜索服务类
 * 使用 FTS5 提供高性能全文搜索
 */
class SearchService {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * 全文搜索
   * @param options 搜索选项
   * @returns 分页搜索结果
   */
  search(options: SearchOptions): PaginatedResult<SearchResult> {
    const {
      query,
      page = 1,
      pageSize = 20,
      fields = ['title', 'content'],
      is_favorite,
      is_archived,
      public_account,
      tag,
      dateFrom,
      dateTo,
    } = options;

    // 构建FTS5查询
    const ftsQuery = this.buildFtsQuery(query, fields);

    // 构建过滤条件
    const conditions: string[] = [];
    const params: any = { ftsQuery };

    if (is_favorite !== undefined) {
      conditions.push('a.is_favorite = @is_favorite');
      params.is_favorite = is_favorite;
    }

    if (is_archived !== undefined) {
      conditions.push('a.is_archived = @is_archived');
      params.is_archived = is_archived;
    }

    if (public_account) {
      conditions.push('a.public_account = @public_account');
      params.public_account = public_account;
    }

    if (tag) {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM article_tags at
          JOIN tags t ON at.tag_id = t.id
          WHERE at.article_id = a.id AND t.name = @tag
        )
      `);
      params.tag = tag;
    }

    if (dateFrom) {
      conditions.push('a.created_at >= @dateFrom');
      params.dateFrom = dateFrom;
    }

    if (dateTo) {
      conditions.push('a.created_at <= @dateTo');
      params.dateTo = dateTo;
    }

    const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    // 查询总数
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM articles_fts fts
      JOIN articles a ON fts.rowid = a.id
      WHERE articles_fts MATCH @ftsQuery ${whereClause}
    `);
    const { total } = countStmt.get(params) as { total: number };

    // 查询数据（按相关性排序）
    const offset = (page - 1) * pageSize;
    const dataStmt = this.db.prepare(`
      SELECT
        a.*,
        snippet(articles_fts, 2, '<mark>', '</mark>', '...', 50) as snippet,
        bm25(articles_fts) as rank
      FROM articles_fts fts
      JOIN articles a ON fts.rowid = a.id
      WHERE articles_fts MATCH @ftsQuery ${whereClause}
      ORDER BY rank
      LIMIT @pageSize OFFSET @offset
    `);

    const results = dataStmt.all({
      ...params,
      pageSize,
      offset,
    }) as SearchResult[];

    // 为每篇文章添加标签
    results.forEach(article => {
      article.tags = this.getArticleTags(article.id!);
    });

    return {
      data: results,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 快速搜索（只搜索标题和摘要）
   * @param query 搜索关键词
   * @param limit 返回数量
   * @returns 搜索结果
   */
  quickSearch(query: string, limit: number = 10): SearchResult[] {
    const ftsQuery = this.buildFtsQuery(query, ['title', 'summary']);

    const stmt = this.db.prepare(`
      SELECT
        a.*,
        snippet(articles_fts, 0, '<mark>', '</mark>', '...', 30) as snippet,
        bm25(articles_fts) as rank
      FROM articles_fts fts
      JOIN articles a ON fts.rowid = a.id
      WHERE articles_fts MATCH @ftsQuery
      ORDER BY rank
      LIMIT @limit
    `);

    const results = stmt.all({ ftsQuery, limit }) as SearchResult[];

    // 为每篇文章添加标签
    results.forEach(article => {
      article.tags = this.getArticleTags(article.id!);
    });

    return results;
  }

  /**
   * 搜索建议
   * 根据部分输入提供搜索建议
   * @param prefix 输入前缀
   * @param limit 返回数量
   * @returns 搜索建议列表
   */
  suggest(prefix: string, limit: number = 5): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];

    // 标题建议
    const titleStmt = this.db.prepare(`
      SELECT DISTINCT title as text, COUNT(*) as count
      FROM articles
      WHERE title LIKE @prefix
      GROUP BY title
      ORDER BY count DESC
      LIMIT @limit
    `);
    const titleResults = titleStmt.all({
      prefix: `${prefix}%`,
      limit,
    }) as { text: string; count: number }[];
    suggestions.push(...titleResults.map(r => ({ ...r, type: 'title' as const })));

    // 作者建议
    const authorStmt = this.db.prepare(`
      SELECT author as text, COUNT(*) as count
      FROM articles
      WHERE author LIKE @prefix
      GROUP BY author
      ORDER BY count DESC
      LIMIT @limit
    `);
    const authorResults = authorStmt.all({
      prefix: `${prefix}%`,
      limit,
    }) as { text: string; count: number }[];
    suggestions.push(...authorResults.map(r => ({ ...r, type: 'author' as const })));

    // 公众号建议
    const accountStmt = this.db.prepare(`
      SELECT public_account as text, COUNT(*) as count
      FROM articles
      WHERE public_account LIKE @prefix
      GROUP BY public_account
      ORDER BY count DESC
      LIMIT @limit
    `);
    const accountResults = accountStmt.all({
      prefix: `${prefix}%`,
      limit,
    }) as { text: string; count: number }[];
    suggestions.push(...accountResults.map(r => ({ ...r, type: 'account' as const })));

    // 标签建议
    const tagStmt = this.db.prepare(`
      SELECT name as text, article_count as count
      FROM tags
      WHERE name LIKE @prefix
      ORDER BY article_count DESC
      LIMIT @limit
    `);
    const tagResults = tagStmt.all({
      prefix: `${prefix}%`,
      limit,
    }) as { text: string; count: number }[];
    suggestions.push(...tagResults.map(r => ({ ...r, type: 'tag' as const })));

    // 按匹配数量排序
    return suggestions
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 高级搜索
   * 支持布尔运算符和短语搜索
   * @param query FTS5查询语法
   * @param options 附加选项
   * @returns 搜索结果
   */
  advancedSearch(
    query: string,
    options: Omit<SearchOptions, 'query' | 'fields'> = {}
  ): PaginatedResult<SearchResult> {
    return this.search({
      ...options,
      query,
      fields: ['title', 'author', 'content', 'summary'],
    });
  }

  /**
   * 相似文章推荐
   * 基于内容相似度推荐相关文章
   * @param articleId 文章ID
   * @param limit 返回数量
   * @returns 相似文章列表
   */
  findSimilar(articleId: number, limit: number = 5): SearchResult[] {
    // 获取文章的关键词
    const articleStmt = this.db.prepare('SELECT title, content FROM articles WHERE id = ?');
    const article = articleStmt.get(articleId) as { title: string; content: string } | undefined;

    if (!article) {
      return [];
    }

    // 提取关键词（简单实现：取标题中的词）
    const keywords = article.title.split(/\s+/).filter(word => word.length > 1).slice(0, 5);
    const query = keywords.join(' OR ');

    // 搜索相似文章
    const stmt = this.db.prepare(`
      SELECT
        a.*,
        bm25(articles_fts) as rank
      FROM articles_fts fts
      JOIN articles a ON fts.rowid = a.id
      WHERE articles_fts MATCH @query
      AND a.id != @articleId
      ORDER BY rank
      LIMIT @limit
    `);

    const results = stmt.all({ query, articleId, limit }) as SearchResult[];

    // 为每篇文章添加标签
    results.forEach(article => {
      article.tags = this.getArticleTags(article.id!);
    });

    return results;
  }

  /**
   * 获取热门搜索词
   * 基于搜索历史统计
   * @param limit 返回数量
   * @returns 热门搜索词列表
   */
  getHotKeywords(limit: number = 10): { keyword: string; count: number }[] {
    // 注意：这需要额外的搜索历史表，这里返回文章标题中的高频词作为示例
    const stmt = this.db.prepare(`
      SELECT title as keyword, read_count as count
      FROM articles
      ORDER BY read_count DESC
      LIMIT ?
    `);

    return stmt.all(limit) as { keyword: string; count: number }[];
  }

  /**
   * 构建 FTS5 查询
   * @param query 用户输入的查询
   * @param fields 搜索字段
   * @returns FTS5查询字符串
   */
  private buildFtsQuery(query: string, fields: string[]): string {
    // 清理和转义查询
    const cleanQuery = query
      .trim()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ') // 保留中文和字母数字
      .replace(/\s+/g, ' ');

    if (!cleanQuery) {
      return '*';
    }

    // 构建字段限定查询
    const terms = cleanQuery.split(' ');
    const fieldQueries = fields.map(field => {
      return terms.map(term => `${field}:${term}*`).join(' OR ');
    });

    return fieldQueries.join(' OR ');
  }

  /**
   * 获取文章的标签
   * @param articleId 文章ID
   * @returns 标签名称数组
   */
  private getArticleTags(articleId: number): string[] {
    const stmt = this.db.prepare(`
      SELECT t.name FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
      ORDER BY t.name
    `);
    const tags = stmt.all(articleId) as { name: string }[];
    return tags.map(t => t.name);
  }

  /**
   * 重建FTS索引
   * 用于修复索引或优化性能
   */
  rebuildIndex(): void {
    this.db.exec(`
      INSERT INTO articles_fts(articles_fts) VALUES('rebuild');
    `);
    console.log('FTS index rebuilt successfully');
  }

  /**
   * 优化FTS索引
   * 合并索引碎片，提高查询性能
   */
  optimizeIndex(): void {
    this.db.exec(`
      INSERT INTO articles_fts(articles_fts) VALUES('optimize');
    `);
    console.log('FTS index optimized successfully');
  }

  /**
   * 获取搜索统计信息
   * @returns 统计数据
   */
  getStats(): {
    indexedArticles: number;
    indexSize: number;
  } {
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM articles_fts');
    const { count } = countStmt.get() as { count: number };

    // 获取索引大小（近似值）
    const sizeStmt = this.db.prepare(`
      SELECT SUM(pgsize) as size FROM dbstat WHERE name = 'articles_fts'
    `);
    const { size } = sizeStmt.get() as { size: number | null };

    return {
      indexedArticles: count,
      indexSize: size || 0,
    };
  }
}

// 导出单例
export default new SearchService();
