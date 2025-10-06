import { getDatabase, runTransaction } from './db';
import Database from 'better-sqlite3';

/**
 * 标签数据接口
 */
export interface Tag {
  id?: number;
  name: string;
  color?: string;
  description?: string;
  article_count?: number;
  created_at?: number;
}

/**
 * 标签统计接口
 */
export interface TagStats {
  id: number;
  name: string;
  color: string;
  description: string | null;
  article_count: number;
  created_at: number;
}

/**
 * 标签服务类
 * 提供标签的管理操作
 */
class TagService {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * 创建标签
   * @param tag 标签数据
   * @returns 创建的标签ID
   */
  create(tag: Tag): number {
    const stmt = this.db.prepare(`
      INSERT INTO tags (name, color, description)
      VALUES (@name, @color, @description)
    `);

    const result = stmt.run({
      name: tag.name,
      color: tag.color || '#1890ff',
      description: tag.description || null,
    });

    return result.lastInsertRowid as number;
  }

  /**
   * 获取或创建标签
   * 如果标签不存在则创建，存在则返回已有标签ID
   * @param name 标签名称
   * @param color 标签颜色（可选）
   * @returns 标签ID
   */
  getOrCreate(name: string, color?: string): number {
    return runTransaction(() => {
      // 尝试获取现有标签
      const existing = this.getByName(name);
      if (existing) {
        return existing.id!;
      }

      // 创建新标签
      return this.create({ name, color });
    });
  }

  /**
   * 根据ID获取标签
   * @param id 标签ID
   * @returns 标签对象
   */
  getById(id: number): Tag | null {
    const stmt = this.db.prepare('SELECT * FROM tags WHERE id = ?');
    const tag = stmt.get(id) as Tag | undefined;
    return tag || null;
  }

  /**
   * 根据名称获取标签
   * @param name 标签名称
   * @returns 标签对象
   */
  getByName(name: string): Tag | null {
    const stmt = this.db.prepare('SELECT * FROM tags WHERE name = ?');
    const tag = stmt.get(name) as Tag | undefined;
    return tag || null;
  }

  /**
   * 获取所有标签
   * @param sortBy 排序字段
   * @returns 标签列表
   */
  getAll(sortBy: 'name' | 'article_count' | 'created_at' = 'name'): TagStats[] {
    const orderMap = {
      name: 'name ASC',
      article_count: 'article_count DESC',
      created_at: 'created_at DESC',
    };

    const stmt = this.db.prepare(`
      SELECT * FROM tags ORDER BY ${orderMap[sortBy]}
    `);

    return stmt.all() as TagStats[];
  }

  /**
   * 获取热门标签
   * @param limit 返回数量
   * @returns 热门标签列表
   */
  getPopular(limit: number = 10): TagStats[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tags
      WHERE article_count > 0
      ORDER BY article_count DESC
      LIMIT ?
    `);

    return stmt.all(limit) as TagStats[];
  }

  /**
   * 更新标签
   * @param id 标签ID
   * @param tag 更新的字段
   * @returns 是否更新成功
   */
  update(id: number, tag: Partial<Tag>): boolean {
    // 构建SET子句
    const fields = Object.keys(tag).filter(key => key !== 'id' && key !== 'article_count' && key !== 'created_at');
    if (fields.length === 0) {
      return false;
    }

    const setClause = fields.map(field => `${field} = @${field}`).join(', ');
    const stmt = this.db.prepare(`
      UPDATE tags SET ${setClause} WHERE id = @id
    `);

    const result = stmt.run({ ...tag, id });
    return result.changes > 0;
  }

  /**
   * 删除标签
   * @param id 标签ID
   * @returns 是否删除成功
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM tags WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * 批量删除标签
   * @param ids 标签ID数组
   * @returns 删除的标签数量
   */
  deleteBatch(ids: number[]): number {
    return runTransaction(() => {
      const stmt = this.db.prepare('DELETE FROM tags WHERE id = ?');
      let count = 0;
      ids.forEach(id => {
        const result = stmt.run(id);
        count += result.changes;
      });
      return count;
    });
  }

  /**
   * 合并标签
   * 将源标签的所有文章关联转移到目标标签，然后删除源标签
   * @param sourceId 源标签ID
   * @param targetId 目标标签ID
   * @returns 是否合并成功
   */
  merge(sourceId: number, targetId: number): boolean {
    if (sourceId === targetId) {
      return false;
    }

    return runTransaction(() => {
      // 获取源标签的所有文章
      const articlesStmt = this.db.prepare(`
        SELECT article_id FROM article_tags WHERE tag_id = ?
      `);
      const articles = articlesStmt.all(sourceId) as { article_id: number }[];

      // 将文章关联转移到目标标签
      const insertStmt = this.db.prepare(`
        INSERT OR IGNORE INTO article_tags (article_id, tag_id)
        VALUES (?, ?)
      `);

      articles.forEach(({ article_id }) => {
        insertStmt.run(article_id, targetId);
      });

      // 删除源标签
      const deleteStmt = this.db.prepare('DELETE FROM tags WHERE id = ?');
      const result = deleteStmt.run(sourceId);

      return result.changes > 0;
    });
  }

  /**
   * 重命名标签
   * @param id 标签ID
   * @param newName 新名称
   * @returns 是否重命名成功
   */
  rename(id: number, newName: string): boolean {
    // 检查新名称是否已存在
    const existing = this.getByName(newName);
    if (existing && existing.id !== id) {
      throw new Error(`标签 "${newName}" 已存在`);
    }

    return this.update(id, { name: newName });
  }

  /**
   * 获取文章的标签
   * @param articleId 文章ID
   * @returns 标签列表
   */
  getArticleTags(articleId: number): Tag[] {
    const stmt = this.db.prepare(`
      SELECT t.* FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
      ORDER BY t.name
    `);

    return stmt.all(articleId) as Tag[];
  }

  /**
   * 为文章添加标签
   * @param articleId 文章ID
   * @param tagId 标签ID
   * @returns 是否添加成功
   */
  addToArticle(articleId: number, tagId: number): boolean {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO article_tags (article_id, tag_id)
      VALUES (?, ?)
    `);

    const result = stmt.run(articleId, tagId);
    return result.changes > 0;
  }

  /**
   * 为文章批量添加标签
   * @param articleId 文章ID
   * @param tagIds 标签ID数组
   * @returns 添加的标签数量
   */
  addToArticleBatch(articleId: number, tagIds: number[]): number {
    return runTransaction(() => {
      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO article_tags (article_id, tag_id)
        VALUES (?, ?)
      `);

      let count = 0;
      tagIds.forEach(tagId => {
        const result = stmt.run(articleId, tagId);
        count += result.changes;
      });

      return count;
    });
  }

  /**
   * 从文章移除标签
   * @param articleId 文章ID
   * @param tagId 标签ID
   * @returns 是否移除成功
   */
  removeFromArticle(articleId: number, tagId: number): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM article_tags WHERE article_id = ? AND tag_id = ?
    `);

    const result = stmt.run(articleId, tagId);
    return result.changes > 0;
  }

  /**
   * 更新文章的标签
   * 先清除现有标签，然后添加新标签
   * @param articleId 文章ID
   * @param tagIds 新的标签ID数组
   * @returns 是否更新成功
   */
  updateArticleTags(articleId: number, tagIds: number[]): boolean {
    return runTransaction(() => {
      // 删除现有标签关联
      const deleteStmt = this.db.prepare('DELETE FROM article_tags WHERE article_id = ?');
      deleteStmt.run(articleId);

      // 添加新标签
      if (tagIds.length > 0) {
        this.addToArticleBatch(articleId, tagIds);
      }

      return true;
    });
  }

  /**
   * 清理未使用的标签
   * 删除文章数量为0的标签
   * @returns 删除的标签数量
   */
  cleanupUnused(): number {
    const stmt = this.db.prepare('DELETE FROM tags WHERE article_count = 0');
    const result = stmt.run();
    return result.changes;
  }

  /**
   * 获取标签统计信息
   * @returns 统计数据
   */
  getStats(): {
    total: number;
    usedCount: number;
    unusedCount: number;
    totalArticles: number;
  } {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN article_count > 0 THEN 1 ELSE 0 END) as usedCount,
        SUM(CASE WHEN article_count = 0 THEN 1 ELSE 0 END) as unusedCount,
        SUM(article_count) as totalArticles
      FROM tags
    `);

    return stmt.get() as any;
  }

  /**
   * 搜索标签
   * @param keyword 搜索关键词
   * @returns 匹配的标签列表
   */
  search(keyword: string): Tag[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tags
      WHERE name LIKE @keyword OR description LIKE @keyword
      ORDER BY article_count DESC
    `);

    return stmt.all({ keyword: `%${keyword}%` }) as Tag[];
  }

  /**
   * 获取标签云数据
   * 返回所有标签及其权重（基于文章数量）
   * @returns 标签云数据
   */
  getTagCloud(): { name: string; value: number; color: string }[] {
    const stmt = this.db.prepare(`
      SELECT name, article_count as value, color
      FROM tags
      WHERE article_count > 0
      ORDER BY article_count DESC
    `);

    return stmt.all() as { name: string; value: number; color: string }[];
  }

  /**
   * 获取相关标签
   * 基于共同出现的文章推荐相关标签
   * @param tagId 标签ID
   * @param limit 返回数量
   * @returns 相关标签列表
   */
  getRelatedTags(tagId: number, limit: number = 5): TagStats[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT t.*, COUNT(*) as co_occurrence
      FROM tags t
      JOIN article_tags at1 ON t.id = at1.tag_id
      WHERE at1.article_id IN (
        SELECT article_id FROM article_tags WHERE tag_id = ?
      )
      AND t.id != ?
      GROUP BY t.id
      ORDER BY co_occurrence DESC
      LIMIT ?
    `);

    return stmt.all(tagId, tagId, limit) as TagStats[];
  }
}

// 导出单例
export default new TagService();
