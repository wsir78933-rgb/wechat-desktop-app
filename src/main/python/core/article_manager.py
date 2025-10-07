"""
文章管理器
负责文章的增删改查、批量操作、搜索等业务逻辑
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

from .database import Database, transaction


logger = logging.getLogger(__name__)


class ArticleManager:
    """文章管理器"""

    def __init__(self, db: Optional[Database] = None):
        """
        初始化文章管理器

        Args:
            db: Database实例，如果为None则创建默认数据库
        """
        if db is None:
            # 默认数据库路径
            import os
            db_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                'resources', 'data', 'database.db'
            )
            db = Database(db_path)
        self.db = db

    def add_article(
        self,
        account_id: int,
        title: str,
        url: str,
        publish_date: Optional[str] = None,
        cover_image: str = "",
        summary: str = "",
        tags: str = "",
        author: str = ""
    ) -> Optional[int]:
        """
        添加文章

        Args:
            account_id: 账号ID（必填）
            title: 文章标题（必填）
            url: 文章链接（必填，同一账号下唯一）
            publish_date: 发布日期，格式YYYY-MM-DD（可选）
            cover_image: 封面图片链接（可选）
            summary: 文章摘要（可选）
            tags: 标签，逗号分隔（可选）
            author: 作者名（可选）

        Returns:
            Optional[int]: 成功返回文章ID，失败返回None
        """
        if not title or not title.strip():
            logger.error("文章标题不能为空")
            return None

        if not url or not url.strip():
            logger.error("文章链接不能为空")
            return None

        try:
            cursor = self.db.execute(
                """
                INSERT INTO articles
                (account_id, title, url, publish_date, cover_image, summary, tags, author)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    account_id,
                    title.strip(),
                    url.strip(),
                    publish_date,
                    cover_image.strip(),
                    summary.strip(),
                    tags.strip(),
                    author.strip()
                )
            )
            self.db.commit()
            article_id = cursor.lastrowid
            logger.info(f"添加文章成功: ID={article_id}, Title={title}")
            return article_id
        except Exception as e:
            logger.error(f"添加文章失败: {e}")
            return None

    def batch_add_articles(self, articles: List[Dict[str, Any]]) -> tuple[bool, int, int]:
        """
        批量添加文章（使用事务）

        Args:
            articles: 文章列表，每个元素为包含文章信息的字典

        Returns:
            tuple[bool, int, int]: (是否成功, 成功数量, 失败数量)
        """
        if not articles:
            logger.warning("文章列表为空")
            return False, 0, 0

        success_count = 0
        fail_count = 0

        try:
            with transaction(self.db):
                for article in articles:
                    try:
                        # 验证必填字段
                        if not article.get('account_id'):
                            logger.warning(f"跳过无效文章: 缺少account_id")
                            fail_count += 1
                            continue

                        if not article.get('title') or not article.get('url'):
                            logger.warning(f"跳过无效文章: 缺少标题或链接")
                            fail_count += 1
                            continue

                        self.db.execute(
                            """
                            INSERT INTO articles
                            (account_id, title, url, publish_date, cover_image, summary, tags, author)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            (
                                article['account_id'],
                                article.get('title', '').strip(),
                                article.get('url', '').strip(),
                                article.get('publish_date'),
                                article.get('cover_image', '').strip(),
                                article.get('summary', '').strip(),
                                article.get('tags', '').strip(),
                                article.get('author', '').strip()
                            )
                        )
                        success_count += 1
                    except Exception as e:
                        logger.warning(f"添加单篇文章失败: {e}, Title={article.get('title')}")
                        fail_count += 1

            logger.info(f"批量添加文章完成: 成功{success_count}篇, 失败{fail_count}篇")
            return True, success_count, fail_count
        except Exception as e:
            logger.error(f"批量添加文章失败: {e}")
            return False, 0, len(articles)

    def update_article(
        self,
        article_id: int,
        title: Optional[str] = None,
        url: Optional[str] = None,
        publish_date: Optional[str] = None,
        cover_image: Optional[str] = None,
        summary: Optional[str] = None,
        tags: Optional[str] = None,
        author: Optional[str] = None
    ) -> bool:
        """
        更新文章信息

        Args:
            article_id: 文章ID
            title: 文章标题（可选）
            url: 文章链接（可选）
            publish_date: 发布日期（可选）
            cover_image: 封面图片链接（可选）
            summary: 文章摘要（可选）
            tags: 标签（可选）
            author: 作者名（可选）

        Returns:
            bool: 是否成功
        """
        # 构建动态更新语句
        update_fields = []
        params = []

        if title is not None:
            if not title.strip():
                logger.error("文章标题不能为空")
                return False
            update_fields.append("title = ?")
            params.append(title.strip())

        if url is not None:
            if not url.strip():
                logger.error("文章链接不能为空")
                return False
            update_fields.append("url = ?")
            params.append(url.strip())

        if publish_date is not None:
            update_fields.append("publish_date = ?")
            params.append(publish_date)

        if cover_image is not None:
            update_fields.append("cover_image = ?")
            params.append(cover_image.strip())

        if summary is not None:
            update_fields.append("summary = ?")
            params.append(summary.strip())

        if tags is not None:
            update_fields.append("tags = ?")
            params.append(tags.strip())

        if author is not None:
            update_fields.append("author = ?")
            params.append(author.strip())

        if not update_fields:
            logger.warning("没有需要更新的字段")
            return False

        # 添加文章ID到参数
        params.append(article_id)

        try:
            sql = f"UPDATE articles SET {', '.join(update_fields)} WHERE id = ?"
            cursor = self.db.execute(sql, tuple(params))
            self.db.commit()

            if cursor.rowcount == 0:
                logger.warning(f"未找到文章: ID={article_id}")
                return False

            logger.info(f"更新文章成功: ID={article_id}")
            return True
        except Exception as e:
            logger.error(f"更新文章失败: {e}")
            return False

    def delete_article(self, article_id: int) -> bool:
        """
        删除文章

        Args:
            article_id: 文章ID

        Returns:
            bool: 是否成功
        """
        try:
            cursor = self.db.execute(
                "DELETE FROM articles WHERE id = ?",
                (article_id,)
            )
            self.db.commit()

            if cursor.rowcount == 0:
                logger.warning(f"未找到文章: ID={article_id}")
                return False

            logger.info(f"删除文章成功: ID={article_id}")
            return True
        except Exception as e:
            logger.error(f"删除文章失败: {e}")
            return False

    def batch_delete_articles(self, article_ids: List[int]) -> tuple[bool, int]:
        """
        批量删除文章

        Args:
            article_ids: 文章ID列表

        Returns:
            tuple[bool, int]: (是否成功, 删除数量)
        """
        if not article_ids:
            logger.warning("文章ID列表为空")
            return False, 0

        try:
            with transaction(self.db):
                placeholders = ','.join('?' * len(article_ids))
                cursor = self.db.execute(
                    f"DELETE FROM articles WHERE id IN ({placeholders})",
                    tuple(article_ids)
                )
                deleted_count = cursor.rowcount

            logger.info(f"批量删除文章成功: 删除{deleted_count}篇")
            return True, deleted_count
        except Exception as e:
            logger.error(f"批量删除文章失败: {e}")
            return False, 0

    def get_article(self, article_id: int) -> Optional[Dict[str, Any]]:
        """
        获取单篇文章信息

        Args:
            article_id: 文章ID

        Returns:
            Optional[Dict[str, Any]]: 文章信息字典，不存在返回None
        """
        try:
            article = self.db.fetchone(
                """
                SELECT
                    ar.*,
                    a.name as account_name,
                    a.category as account_category
                FROM articles ar
                JOIN accounts a ON ar.account_id = a.id
                WHERE ar.id = ?
                """,
                (article_id,)
            )

            if article:
                logger.debug(f"获取文章成功: ID={article_id}")
            else:
                logger.warning(f"未找到文章: ID={article_id}")

            return article
        except Exception as e:
            logger.error(f"获取文章失败: {e}")
            return None

    def get_articles_by_account(
        self,
        account_id: int,
        limit: Optional[int] = None,
        offset: int = 0,
        order_by: str = "publish_date"
    ) -> List[Dict[str, Any]]:
        """
        获取指定账号下的文章列表

        Args:
            account_id: 账号ID
            limit: 限制数量（可选，用于分页）
            offset: 偏移量（可选，用于分页）
            order_by: 排序字段，可选值：
                - publish_date: 按发布日期排序（默认，降序）
                - title: 按标题排序（升序）
                - created_at: 按创建时间排序（降序）

        Returns:
            List[Dict[str, Any]]: 文章列表
        """
        # 验证排序字段
        valid_orders = {
            "publish_date": "ar.publish_date DESC NULLS LAST",
            "title": "ar.title ASC",
            "created_at": "ar.created_at DESC"
        }

        order_clause = valid_orders.get(order_by, valid_orders["publish_date"])

        try:
            sql = f"""
                SELECT
                    ar.*,
                    a.name as account_name,
                    a.category as account_category
                FROM articles ar
                JOIN accounts a ON ar.account_id = a.id
                WHERE ar.account_id = ?
                ORDER BY {order_clause}
            """

            # 添加分页
            if limit is not None:
                sql += f" LIMIT {limit} OFFSET {offset}"

            articles = self.db.fetchall(sql, (account_id,))
            logger.debug(f"获取账号文章成功: AccountID={account_id}, 数量={len(articles)}")
            return articles
        except Exception as e:
            logger.error(f"获取账号文章失败: {e}")
            return []

    def search_articles(
        self,
        keyword: str,
        account_id: Optional[int] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        tags: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        搜索文章

        Args:
            keyword: 搜索关键词（搜索标题、摘要、标签）
            account_id: 账号ID筛选（可选）
            date_from: 起始日期，格式YYYY-MM-DD（可选）
            date_to: 结束日期，格式YYYY-MM-DD（可选）
            tags: 标签筛选（可选）

        Returns:
            List[Dict[str, Any]]: 搜索结果列表
        """
        try:
            sql = """
                SELECT
                    ar.*,
                    a.name as account_name,
                    a.category as account_category
                FROM articles ar
                JOIN accounts a ON ar.account_id = a.id
                WHERE (ar.title LIKE ? OR ar.summary LIKE ? OR ar.tags LIKE ?)
            """

            params = [f"%{keyword}%", f"%{keyword}%", f"%{keyword}%"]

            # 添加账号筛选
            if account_id is not None:
                sql += " AND ar.account_id = ?"
                params.append(account_id)

            # 添加日期范围筛选
            if date_from:
                sql += " AND ar.publish_date >= ?"
                params.append(date_from)

            if date_to:
                sql += " AND ar.publish_date <= ?"
                params.append(date_to)

            # 添加标签筛选
            if tags:
                sql += " AND ar.tags LIKE ?"
                params.append(f"%{tags}%")

            sql += " ORDER BY ar.publish_date DESC NULLS LAST"

            articles = self.db.fetchall(sql, tuple(params))
            logger.debug(f"搜索文章成功: 关键词={keyword}, 结果数={len(articles)}")
            return articles
        except Exception as e:
            logger.error(f"搜索文章失败: {e}")
            return []

    def get_all_articles(
        self,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        获取所有文章列表

        Args:
            limit: 限制数量（可选）
            offset: 偏移量（可选）

        Returns:
            List[Dict[str, Any]]: 文章列表
        """
        try:
            sql = """
                SELECT
                    ar.*,
                    a.name as account_name,
                    a.category as account_category
                FROM articles ar
                JOIN accounts a ON ar.account_id = a.id
                ORDER BY ar.publish_date DESC NULLS LAST
            """

            if limit is not None:
                sql += f" LIMIT {limit} OFFSET {offset}"

            articles = self.db.fetchall(sql)
            logger.debug(f"获取所有文章成功: 数量={len(articles)}")
            return articles
        except Exception as e:
            logger.error(f"获取所有文章失败: {e}")
            return []

    def article_exists(self, account_id: int, url: str) -> bool:
        """
        检查文章是否存在（同一账号下URL唯一）

        Args:
            account_id: 账号ID
            url: 文章链接

        Returns:
            bool: 是否存在
        """
        try:
            result = self.db.fetchone(
                "SELECT id FROM articles WHERE account_id = ? AND url = ?",
                (account_id, url.strip())
            )
            return result is not None
        except Exception as e:
            logger.error(f"检查文章存在性失败: {e}")
            return False

    def get_article_count(self, account_id: Optional[int] = None) -> int:
        """
        获取文章总数

        Args:
            account_id: 账号ID（可选），不指定则统计所有文章

        Returns:
            int: 文章总数
        """
        try:
            if account_id is not None:
                result = self.db.fetchone(
                    "SELECT COUNT(*) as count FROM articles WHERE account_id = ?",
                    (account_id,)
                )
            else:
                result = self.db.fetchone(
                    "SELECT COUNT(*) as count FROM articles"
                )

            count = result['count'] if result else 0
            logger.debug(f"获取文章数成功: {count}")
            return count
        except Exception as e:
            logger.error(f"获取文章数失败: {e}")
            return 0

    def get_recent_articles(self, days: int = 7, limit: int = 10) -> List[Dict[str, Any]]:
        """
        获取最近N天的文章

        Args:
            days: 天数（默认7天）
            limit: 限制数量（默认10篇）

        Returns:
            List[Dict[str, Any]]: 文章列表
        """
        try:
            articles = self.db.fetchall(
                """
                SELECT
                    ar.*,
                    a.name as account_name,
                    a.category as account_category
                FROM articles ar
                JOIN accounts a ON ar.account_id = a.id
                WHERE ar.publish_date >= date('now', '-' || ? || ' days')
                ORDER BY ar.publish_date DESC
                LIMIT ?
                """,
                (days, limit)
            )
            logger.debug(f"获取最近文章成功: {days}天内, 数量={len(articles)}")
            return articles
        except Exception as e:
            logger.error(f"获取最近文章失败: {e}")
            return []
