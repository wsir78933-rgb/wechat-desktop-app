"""
日志工具模块
提供统一的日志配置和管理功能
"""

import logging
import sys
from pathlib import Path
from datetime import datetime
from logging.handlers import RotatingFileHandler


class Logger:
    """日志管理类"""

    _initialized = False

    @staticmethod
    def setup(
        name: str = "AccountManager",
        level: int = logging.INFO,
        log_dir: str = "logs",
        console: bool = True,
        file_logging: bool = True,
        max_bytes: int = 10 * 1024 * 1024,  # 10MB
        backup_count: int = 5
    ):
        """
        初始化日志配置

        Args:
            name: 日志器名称
            level: 日志级别（DEBUG, INFO, WARNING, ERROR, CRITICAL）
            log_dir: 日志文件目录
            console: 是否输出到控制台
            file_logging: 是否输出到文件
            max_bytes: 单个日志文件最大字节数
            backup_count: 保留的历史日志文件数量
        """
        if Logger._initialized:
            return

        # 创建根日志器
        root_logger = logging.getLogger()
        root_logger.setLevel(level)

        # 清除现有处理器
        root_logger.handlers.clear()

        # 日志格式
        formatter = logging.Formatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        # 控制台处理器
        if console:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setLevel(level)
            console_handler.setFormatter(formatter)
            root_logger.addHandler(console_handler)

        # 文件处理器
        if file_logging:
            # 确保日志目录存在
            log_path = Path(log_dir)
            log_path.mkdir(parents=True, exist_ok=True)

            # 创建日志文件名（按日期）
            today = datetime.now().strftime("%Y-%m-%d")
            log_file = log_path / f"{name}_{today}.log"

            # 使用RotatingFileHandler进行日志轮转
            file_handler = RotatingFileHandler(
                filename=str(log_file),
                maxBytes=max_bytes,
                backupCount=backup_count,
                encoding='utf-8'
            )
            file_handler.setLevel(level)
            file_handler.setFormatter(formatter)
            root_logger.addHandler(file_handler)

        Logger._initialized = True
        root_logger.info(f"日志系统初始化完成 - 日志级别: {logging.getLevelName(level)}")

    @staticmethod
    def get_logger(name: str = None) -> logging.Logger:
        """
        获取日志器实例

        Args:
            name: 日志器名称，不指定则返回根日志器

        Returns:
            logging.Logger: 日志器实例
        """
        if not Logger._initialized:
            Logger.setup()

        return logging.getLogger(name)


def get_logger(name: str = None) -> logging.Logger:
    """
    快捷函数：获取日志器

    Args:
        name: 日志器名称

    Returns:
        logging.Logger: 日志器实例
    """
    return Logger.get_logger(name)
