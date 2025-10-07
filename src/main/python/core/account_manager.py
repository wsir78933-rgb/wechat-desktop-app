"""
账号管理器
负责账号的增删改查、搜索等业务逻辑
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

from .database import Database, transaction


logger = logging.getLogger(__name__)


class AccountManager:
    """账号管理器"""

    def __init__(self, db: Optional[Database] = None):
        """
        初始化账号管理器

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

    def add_account(
        self,
        name: str,
        category: str,
        description: str = "",
        avatar_url: str = ""
    ) -> Optional[int]:
        """
        添加账号

        Args:
            name: 账号名称/作者名（必填，唯一）
            category: 账号分类（必填）
            description: 账号描述（可选）
            avatar_url: 头像链接（可选）

        Returns:
            Optional[int]: 成功返回账号ID，失败返回None
        """
        if not name or not name.strip():
            logger.error("账号名称不能为空")
            return None

        if not category or not category.strip():
            logger.error("账号分类不能为空")
            return None

        try:
            cursor = self.db.execute(
                """
                INSERT INTO accounts (name, category, description, avatar_url)
                VALUES (?, ?, ?, ?)
                """,
                (name.strip(), category.strip(), description.strip(), avatar_url.strip())
            )
            self.db.commit()
            account_id = cursor.lastrowid
            logger.info(f"添加账号成功: ID={account_id}, Name={name}")
            return account_id
        except Exception as e:
            logger.error(f"添加账号失败: {e}")
            return None

    def update_account(
        self,
        account_id: int,
        name: Optional[str] = None,
        category: Optional[str] = None,
        description: Optional[str] = None,
        avatar_url: Optional[str] = None
    ) -> bool:
        """
        更新账号信息

        Args:
            account_id: 账号ID
            name: 账号名称（可选）
            category: 账号分类（可选）
            description: 账号描述（可选）
            avatar_url: 头像链接（可选）

        Returns:
            bool: 是否成功
        """
        # 构建动态更新语句
        update_fields = []
        params = []

        if name is not None:
            if not name.strip():
                logger.error("账号名称不能为空")
                return False
            update_fields.append("name = ?")
            params.append(name.strip())

        if category is not None:
            if not category.strip():
                logger.error("账号分类不能为空")
                return False
            update_fields.append("category = ?")
            params.append(category.strip())

        if description is not None:
            update_fields.append("description = ?")
            params.append(description.strip())

        if avatar_url is not None:
            update_fields.append("avatar_url = ?")
            params.append(avatar_url.strip())

        if not update_fields:
            logger.warning("没有需要更新的字段")
            return False

        # 添加更新时间
        update_fields.append("updated_at = CURRENT_TIMESTAMP")

        # 添加账号ID到参数
        params.append(account_id)

        try:
            sql = f"UPDATE accounts SET {', '.join(update_fields)} WHERE id = ?"
            cursor = self.db.execute(sql, tuple(params))
            self.db.commit()

            if cursor.rowcount == 0:
                logger.warning(f"未找到账号: ID={account_id}")
                return False

            logger.info(f"更新账号成功: ID={account_id}")
            return True
        except Exception as e:
            logger.error(f"更新账号失败: {e}")
            return False

    def delete_account(self, account_id: int) -> bool:
        """
        删除账号（级联删除关联的文章）

        Args:
            account_id: 账号ID

        Returns:
            bool: 是否成功
        """
        try:
            with transaction(self.db):
                # 由于设置了外键级联删除，直接删除账号即可
                cursor = self.db.execute(
                    "DELETE FROM accounts WHERE id = ?",
                    (account_id,)
                )

                if cursor.rowcount == 0:
                    logger.warning(f"未找到账号: ID={account_id}")
                    return False

                logger.info(f"删除账号成功: ID={account_id}")
                return True
        except Exception as e:
            logger.error(f"删除账号失败: {e}")
            return False

    def get_account(self, account_id: int) -> Optional[Dict[str, Any]]:
        """
        获取单个账号信息

        Args:
            account_id: 账号ID

        Returns:
            Optional[Dict[str, Any]]: 账号信息字典，不存在返回None
        """
        try:
            account = self.db.fetchone(
                "SELECT * FROM accounts WHERE id = ?",
                (account_id,)
            )

            if account:
                logger.debug(f"获取账号成功: ID={account_id}")
            else:
                logger.warning(f"未找到账号: ID={account_id}")

            return account
        except Exception as e:
            logger.error(f"获取账号失败: {e}")
            return None

    def get_all_accounts(self, order_by: str = "latest_date") -> List[Dict[str, Any]]:
        """
        获取所有账号列表（包含文章数和最新日期）

        Args:
            order_by: 排序字段，可选值：
                - latest_date: 按最新文章日期排序（默认）
                - name: 按账号名称排序
                - category: 按分类排序
                - created_at: 按创建时间排序
                - article_count: 按文章数排序

        Returns:
            List[Dict[str, Any]]: 账号列表
        """
        # 验证排序字段
        valid_orders = {
            "latest_date": "latest_date DESC NULLS LAST",
            "name": "a.name ASC",
            "category": "a.category ASC, a.name ASC",
            "created_at": "a.created_at DESC",
            "article_count": "article_count DESC"
        }

        order_clause = valid_orders.get(order_by, valid_orders["latest_date"])

        try:
            accounts = self.db.fetchall(f"""
                SELECT
                    a.id,
                    a.name,
                    a.category,
                    a.description,
                    a.avatar_url,
                    a.created_at,
                    a.updated_at,
                    COUNT(ar.id) as article_count,
                    MAX(ar.publish_date) as latest_date
                FROM accounts a
                LEFT JOIN articles ar ON a.id = ar.account_id
                GROUP BY a.id
                ORDER BY {order_clause}
            """)

            logger.debug(f"获取所有账号成功: 共{len(accounts)}个")
            return accounts
        except Exception as e:
            logger.error(f"获取所有账号失败: {e}")
            return []

    def search_accounts(
        self,
        keyword: str,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        搜索账号

        Args:
            keyword: 搜索关键词（搜索账号名称和描述）
            category: 分类筛选（可选）

        Returns:
            List[Dict[str, Any]]: 搜索结果列表
        """
        try:
            sql = """
                SELECT
                    a.id,
                    a.name,
                    a.category,
                    a.description,
                    a.avatar_url,
                    a.created_at,
                    a.updated_at,
                    COUNT(ar.id) as article_count,
                    MAX(ar.publish_date) as latest_date
                FROM accounts a
                LEFT JOIN articles ar ON a.id = ar.account_id
                WHERE (a.name LIKE ? OR a.description LIKE ?)
            """

            params = [f"%{keyword}%", f"%{keyword}%"]

            # 添加分类筛选
            if category:
                sql += " AND a.category = ?"
                params.append(category)

            sql += """
                GROUP BY a.id
                ORDER BY latest_date DESC NULLS LAST
            """

            accounts = self.db.fetchall(sql, tuple(params))
            logger.debug(f"搜索账号成功: 关键词={keyword}, 结果数={len(accounts)}")
            return accounts
        except Exception as e:
            logger.error(f"搜索账号失败: {e}")
            return []

    def get_categories(self) -> List[str]:
        """
        获取所有分类列表（去重）

        Returns:
            List[str]: 分类列表
        """
        try:
            result = self.db.fetchall(
                """
                SELECT DISTINCT category
                FROM accounts
                WHERE category IS NOT NULL AND category != ''
                ORDER BY category
                """
            )
            categories = [row['category'] for row in result]
            logger.debug(f"获取分类列表成功: {categories}")
            return categories
        except Exception as e:
            logger.error(f"获取分类列表失败: {e}")
            return []

    def account_exists(self, name: str) -> bool:
        """
        检查账号是否存在

        Args:
            name: 账号名称

        Returns:
            bool: 是否存在
        """
        try:
            result = self.db.fetchone(
                "SELECT id FROM accounts WHERE name = ?",
                (name.strip(),)
            )
            return result is not None
        except Exception as e:
            logger.error(f"检查账号存在性失败: {e}")
            return False

    def get_account_stats(self, account_id: int) -> Optional[Dict[str, Any]]:
        """
        获取账号统计信息

        Args:
            account_id: 账号ID

        Returns:
            Optional[Dict[str, Any]]: 统计信息字典，包含：
                - total_articles: 文章总数
                - latest_date: 最新文章日期
                - earliest_date: 最早文章日期
        """
        try:
            stats = self.db.fetchone(
                """
                SELECT
                    COUNT(id) as total_articles,
                    MAX(publish_date) as latest_date,
                    MIN(publish_date) as earliest_date
                FROM articles
                WHERE account_id = ?
                """,
                (account_id,)
            )
            logger.debug(f"获取账号统计信息成功: ID={account_id}")
            return stats
        except Exception as e:
            logger.error(f"获取账号统计信息失败: {e}")
            return None
