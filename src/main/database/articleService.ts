import { getDatabase, runTransaction } from './db';
import Database from 'better-sqlite3';

/**
 * 文章数据接口
 */
export interface Article {
  id?: number;
  title: string;
  author?: string;
  content: string;
  html_content?: string;
  summary?: string;
  cover_image?: string;
  source_url?: string;
  public_account?: string;
  publish_time?: number;
  read_count?: number;
  like_count?: number;
  is_favorite?: number;
  is_archived?: number;
  created_at?: number;
  updated_at?: number;
  tags?: string[]; // 标签名称数组
}

/**
 * 查询选项接口
 */
export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'publish_time' | 'updated_at' | 'read_count' | 'like_count';
  sortOrder?: 'ASC' | 'DESC';
  is_favorite?: number;
  is_archived?: number;
  public_account?: string;
  author?: string;
  tag?: string;
}

/**
 * 分页结果接口
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 文章服务类
 * 提供文章的CRUD操作
 */
class ArticleService {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * 创建文章
   * @param article 文章数据
   * @returns 创建的文章ID
   */
  create(article: Article): number {
    const tags = article.tags || [];
    delete article.tags;

    return runTransaction(() => {
      // 插入文章
      const stmt = this.db.prepare(`
        INSERT INTO articles (
          title, author, content, html_content, summary,
          cover_image, source_url, public_account, publish_time,
          read_count, like_count, is_favorite, is_archived
        ) VALUES (
          @title, @author, @content, @html_content, @summary,
          @cover_image, @source_url, @public_account, @publish_time,
          @read_count, @like_count, @is_favorite, @is_archived
        )
      `);

      const result = stmt.run({
        title: article.title,
        author: article.author || null,
        content: article.content,
        html_content: article.html_content || null,
        summary: article.summary || null,
        cover_image: article.cover_image || null,
        source_url: article.source_url || null,
        public_account: article.public_account || null,
        publish_time: article.publish_time || null,
        read_count: article.read_count || 0,
        like_count: article.like_count || 0,
        is_favorite: article.is_favorite || 0,
        is_archived: article.is_archived || 0,
      });

      const articleId = result.lastInsertRowid as number;

      // 关联标签
      if (tags.length > 0) {
        this.addTags(articleId, tags);
      }

      return articleId;
    });
  }

  /**
   * 批量创建文章
   * @param articles 文章数组
   * @returns 创建的文章ID数组
   */
  createBatch(articles: Article[]): number[] {
    return runTransaction(() => {
      return articles.map(article => this.create(article));
    });
  }

  /**
   * 根据ID获取文章
   * @param id 文章ID
   * @returns 文章对象（包含标签）
   */
  getById(id: number): Article | null {
    const stmt = this.db.prepare('SELECT * FROM articles WHERE id = ?');
    const article = stmt.get(id) as Article | undefined;

    if (!article) {
      return null;
    }

    // 获取关联标签
    article.tags = this.getArticleTags(id);
    return article;
  }

  /**
   * 查询文章列表（支持分页和过滤）
   * @param options 查询选项
   * @returns 分页结果
   */
  query(options: QueryOptions = {}): PaginatedResult<Article> {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      is_favorite,
      is_archived,
      public_account,
      author,
      tag,
    } = options;

    // 构建WHERE子句
    const conditions: string[] = [];
    const params: any = {};

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

    if (author) {
      conditions.push('a.author = @author');
      params.author = author;
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 查询总数
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total FROM articles a ${whereClause}
    `);
    const { total } = countStmt.get(params) as { total: number };

    // 查询数据
    const offset = (page - 1) * pageSize;
    const dataStmt = this.db.prepare(`
      SELECT a.* FROM articles a
      ${whereClause}
      ORDER BY a.${sortBy} ${sortOrder}
      LIMIT @pageSize OFFSET @offset
    `);

    const articles = dataStmt.all({
      ...params,
      pageSize,
      offset,
    }) as Article[];

    // 为每篇文章添加标签
    articles.forEach(article => {
      article.tags = this.getArticleTags(article.id!);
    });

    return {
      data: articles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 更新文章
   * @param id 文章ID
   * @param article 更新的字段
   * @returns 是否更新成功
   */
  update(id: number, article: Partial<Article>): boolean {
    const tags = article.tags;
    delete article.tags;

    return runTransaction(() => {
      // 构建SET子句
      const fields = Object.keys(article).filter(key => key !== 'id');
      if (fields.length === 0 && !tags) {
        return false;
      }

      if (fields.length > 0) {
        const setClause = fields.map(field => `${field} = @${field}`).join(', ');
        const stmt = this.db.prepare(`
          UPDATE articles SET ${setClause} WHERE id = @id
        `);

        const result = stmt.run({ ...article, id });
        if (result.changes === 0) {
          return false;
        }
      }

      // 更新标签
      if (tags) {
        this.updateTags(id, tags);
      }

      return true;
    });
  }

  /**
   * 删除文章
   * @param id 文章ID
   * @returns 是否删除成功
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM articles WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * 批量删除文章
   * @param ids 文章ID数组
   * @returns 删除的文章数量
   */
  deleteBatch(ids: number[]): number {
    return runTransaction(() => {
      const stmt = this.db.prepare('DELETE FROM articles WHERE id = ?');
      let count = 0;
      ids.forEach(id => {
        const result = stmt.run(id);
        count += result.changes;
      });
      return count;
    });
  }

  /**
   * 增加阅读次数
   * @param id 文章ID
   */
  incrementReadCount(id: number): void {
    const stmt = this.db.prepare(`
      UPDATE articles SET read_count = read_count + 1 WHERE id = ?
    `);
    stmt.run(id);
  }

  /**
   * 切换收藏状态
   * @param id 文章ID
   * @returns 新的收藏状态
   */
  toggleFavorite(id: number): boolean {
    const stmt = this.db.prepare(`
      UPDATE articles SET is_favorite = NOT is_favorite WHERE id = ?
    `);
    stmt.run(id);

    const article = this.getById(id);
    return article?.is_favorite === 1;
  }

  /**
   * 切换归档状态
   * @param id 文章ID
   * @returns 新的归档状态
   */
  toggleArchive(id: number): boolean {
    const stmt = this.db.prepare(`
      UPDATE articles SET is_archived = NOT is_archived WHERE id = ?
    `);
    stmt.run(id);

    const article = this.getById(id);
    return article?.is_archived === 1;
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
   * 为文章添加标签
   * @param articleId 文章ID
   * @param tagNames 标签名称数组
   */
  private addTags(articleId: number, tagNames: string[]): void {
    const tagService = require('./tagService').default;
    const tagIds = tagNames.map(name => tagService.getOrCreate(name));

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO article_tags (article_id, tag_id)
      VALUES (?, ?)
    `);

    tagIds.forEach(tagId => {
      stmt.run(articleId, tagId);
    });
  }

  /**
   * 更新文章的标签
   * @param articleId 文章ID
   * @param tagNames 新的标签名称数组
   */
  private updateTags(articleId: number, tagNames: string[]): void {
    // 删除现有标签关联
    const deleteStmt = this.db.prepare('DELETE FROM article_tags WHERE article_id = ?');
    deleteStmt.run(articleId);

    // 添加新标签
    if (tagNames.length > 0) {
      this.addTags(articleId, tagNames);
    }
  }

  /**
   * 获取统计信息
   * @returns 统计数据
   */
  getStats(): {
    total: number;
    favoriteCount: number;
    archivedCount: number;
    totalReadCount: number;
  } {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as favoriteCount,
        SUM(CASE WHEN is_archived = 1 THEN 1 ELSE 0 END) as archivedCount,
        SUM(read_count) as totalReadCount
      FROM articles
    `);

    return stmt.get() as any;
  }

  /**
   * 获取公众号列表
   * @returns 公众号列表（带文章数量）
   */
  getPublicAccounts(): { name: string; count: number }[] {
    const stmt = this.db.prepare(`
      SELECT public_account as name, COUNT(*) as count
      FROM articles
      WHERE public_account IS NOT NULL
      GROUP BY public_account
      ORDER BY count DESC
    `);

    return stmt.all() as { name: string; count: number }[];
  }

  /**
   * 获取作者列表
   * @returns 作者列表（带文章数量）
   */
  getAuthors(): { name: string; count: number }[] {
    const stmt = this.db.prepare(`
      SELECT author as name, COUNT(*) as count
      FROM articles
      WHERE author IS NOT NULL
      GROUP BY author
      ORDER BY count DESC
    `);

    return stmt.all() as { name: string; count: number }[];
  }
}

// 导出单例
export default new ArticleService();
