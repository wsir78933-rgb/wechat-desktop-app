"""
数据库操作类
实现单例模式、连接管理、事务处理
"""
import sqlite3
import logging
from contextlib import contextmanager
from pathlib import Path
from typing import Optional, List, Dict, Any


logger = logging.getLogger(__name__)


class Database:
    """数据库操作类（单例模式）"""

    _instance = None
    _connection = None

    def __new__(cls, db_path: str):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, db_path: str):
        if self._connection is None:
            # 确保数据库目录存在
            db_file = Path(db_path)
            db_file.parent.mkdir(parents=True, exist_ok=True)

            self._connection = sqlite3.connect(
                db_path,
                check_same_thread=False,  # 允许多线程
                isolation_level='DEFERRED'  # 事务级别
            )
            self._connection.row_factory = sqlite3.Row  # 返回字典格式
            self._enable_foreign_keys()
            self._create_tables()
            logger.info(f"数据库连接成功: {db_path}")

    def _enable_foreign_keys(self):
        """启用外键约束"""
        self._connection.execute("PRAGMA foreign_keys = ON")

    def _create_tables(self):
        """创建数据库表"""
        # 创建账号表
        self._connection.execute("""
            CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                category TEXT,
                description TEXT,
                avatar_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 创建账号表索引
        self._connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_accounts_name ON accounts(name)
        """)
        self._connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_accounts_category ON accounts(category)
        """)

        # 创建文章表
        self._connection.execute("""
            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                publish_date DATE,
                cover_image TEXT,
                summary TEXT,
                tags TEXT,
                author TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
            )
        """)

        # 创建文章表索引
        self._connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_articles_account_id ON articles(account_id)
        """)
        self._connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_articles_publish_date ON articles(publish_date)
        """)
        self._connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url)
        """)

        # 创建唯一性约束
        self._connection.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_unique
            ON articles(account_id, url)
        """)

        self._connection.commit()
        logger.info("数据库表创建完成")

        # 初始化素材库系统账号
        self._init_material_library()

    def _init_material_library(self):
        """初始化素材库系统账号"""
        # 检查素材库账号是否存在
        cursor = self._connection.execute(
            "SELECT id FROM accounts WHERE name = ?",
            ("📚 素材库",)
        )
        if cursor.fetchone() is None:
            # 创建素材库账号
            self._connection.execute("""
                INSERT INTO accounts (name, category, description)
                VALUES (?, ?, ?)
            """, (
                "📚 素材库",
                "系统",
                "收藏的文章素材，不属于任何对标账号"
            ))
            self._connection.commit()
            logger.info("素材库系统账号创建成功")

    def execute(self, sql: str, params: tuple = ()) -> sqlite3.Cursor:
        """
        执行SQL语句

        Args:
            sql: SQL语句
            params: 参数元组

        Returns:
            sqlite3.Cursor: 游标对象
        """
        try:
            return self._connection.execute(sql, params)
        except sqlite3.Error as e:
            logger.error(f"SQL执行错误: {e}, SQL: {sql}, Params: {params}")
            raise

    def executemany(self, sql: str, params_list: List[tuple]) -> sqlite3.Cursor:
        """
        批量执行SQL语句

        Args:
            sql: SQL语句
            params_list: 参数列表

        Returns:
            sqlite3.Cursor: 游标对象
        """
        try:
            return self._connection.executemany(sql, params_list)
        except sqlite3.Error as e:
            logger.error(f"SQL批量执行错误: {e}, SQL: {sql}")
            raise

    def commit(self):
        """提交事务"""
        self._connection.commit()

    def rollback(self):
        """回滚事务"""
        self._connection.rollback()

    def fetchone(self, sql: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        """
        查询单条记录

        Args:
            sql: SQL语句
            params: 参数元组

        Returns:
            Optional[Dict[str, Any]]: 查询结果（字典格式）
        """
        cursor = self.execute(sql, params)
        row = cursor.fetchone()
        return dict(row) if row else None

    def fetchall(self, sql: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """
        查询多条记录

        Args:
            sql: SQL语句
            params: 参数元组

        Returns:
            List[Dict[str, Any]]: 查询结果列表
        """
        cursor = self.execute(sql, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

    def close(self):
        """关闭数据库连接"""
        if self._connection:
            self._connection.close()
            self._connection = None
            logger.info("数据库连接已关闭")

    def __del__(self):
        """析构函数"""
        self.close()


@contextmanager
def transaction(db: Database):
    """
    事务上下文管理器

    Args:
        db: Database实例

    Example:
        with transaction(db):
            db.execute("INSERT INTO ...")
            db.execute("UPDATE ...")
    """
    try:
        yield db
        db.commit()
        logger.debug("事务提交成功")
    except Exception as e:
        db.rollback()
        logger.error(f"事务回滚: {e}")
        raise
