"""
对标账号管理软件 - 入口文件
Author: Claude Code
Version: 1.0
Date: 2025-01-15
"""

import sys
import os
import logging
from PyQt5.QtWidgets import QApplication, QMessageBox
from PyQt5.QtCore import Qt


def setup_logging(debug_mode=False):
    """配置日志系统"""
    log_level = logging.DEBUG if debug_mode else logging.INFO

    # 创建logs目录
    log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "logs")
    os.makedirs(log_dir, exist_ok=True)

    log_file = os.path.join(log_dir, "app.log")

    # 配置日志格式
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    # 配置根日志记录器
    logging.basicConfig(
        level=log_level,
        format=log_format,
        datefmt=date_format,
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler(sys.stdout)
        ]
    )

    logger = logging.getLogger(__name__)
    logger.info("="*50)
    logger.info("应用程序启动")
    logger.info(f"Python版本: {sys.version}")
    logger.info(f"调试模式: {debug_mode}")
    logger.info("="*50)

    return logger


def setup_paths():
    """配置Python路径"""
    # 获取src/main/python目录的绝对路径
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # 将src/main/python添加到Python路径（确保在最前面）
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)

    # 同时添加项目根目录
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

    # 打印路径信息（调试用）
    logger = logging.getLogger(__name__)
    logger.debug(f"当前工作目录: {os.getcwd()}")
    logger.debug(f"Python路径(src/main/python): {current_dir}")
    logger.debug(f"项目根目录: {project_root}")
    logger.debug(f"完整sys.path: {sys.path}")


def setup_database():
    """初始化数据库"""
    logger = logging.getLogger(__name__)

    try:
        # 获取data目录路径
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        data_dir = os.path.join(project_root, "data")
        os.makedirs(data_dir, exist_ok=True)

        db_path = os.path.join(data_dir, "database.db")
        logger.info(f"数据库路径: {db_path}")

        # TODO: 初始化数据库连接和表结构
        # from core.database import Database
        # db = Database(db_path)

        return db_path
    except Exception as e:
        logger.error(f"数据库初始化失败: {e}", exc_info=True)
        return None


def create_application(debug_mode=False):
    """创建并配置QApplication"""
    # 创建应用程序实例
    app = QApplication(sys.argv)

    # 设置应用程序信息
    app.setApplicationName("对标账号管理软件")
    app.setApplicationVersion("1.0")
    app.setOrganizationName("Claude Code")

    # 设置应用程序样式
    app.setStyle("Fusion")

    # 启用高DPI支持
    if hasattr(Qt, 'AA_EnableHighDpiScaling'):
        QApplication.setAttribute(Qt.AA_EnableHighDpiScaling, True)
    if hasattr(Qt, 'AA_UseHighDpiPixmaps'):
        QApplication.setAttribute(Qt.AA_UseHighDpiPixmaps, True)

    return app


def main():
    """主函数"""
    # 解析命令行参数
    debug_mode = '--debug' in sys.argv or '-d' in sys.argv

    # 配置日志
    logger = setup_logging(debug_mode)

    try:
        # 配置路径
        setup_paths()

        # 初始化数据库
        db_path = setup_database()
        if not db_path:
            logger.error("数据库初始化失败，程序退出")
            return 1

        # 创建应用程序
        app = create_application(debug_mode)

        # 导入主窗口
        try:
            from ui.main_window import MainWindow
        except ImportError as e:
            logger.error(f"无法导入主窗口: {e}", exc_info=True)
            QMessageBox.critical(
                None,
                "错误",
                f"无法启动应用程序：\n{str(e)}\n\n请检查程序安装是否完整。"
            )
            return 1

        # 创建并显示主窗口
        logger.info("创建主窗口...")
        main_window = MainWindow()
        main_window.show()

        logger.info("主窗口显示成功，进入事件循环")

        # 进入事件循环
        exit_code = app.exec_()

        logger.info(f"应用程序退出，退出码: {exit_code}")
        return exit_code

    except Exception as e:
        logger.error(f"程序运行出错: {e}", exc_info=True)

        # 显示错误对话框
        try:
            QMessageBox.critical(
                None,
                "严重错误",
                f"程序运行出错：\n{str(e)}\n\n详细信息请查看日志文件。"
            )
        except:
            pass

        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
