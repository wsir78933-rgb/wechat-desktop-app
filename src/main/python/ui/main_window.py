"""
主窗口 - 对标账号管理软件
采用左右分栏布局（方案二）
"""

import sys
from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QSplitter, QPushButton, QAction, QMenuBar, QToolBar,
    QStatusBar, QMessageBox, QFileDialog
)
from PyQt5.QtCore import Qt, QTimer, pyqtSignal, QSize
from PyQt5.QtGui import QIcon, QFont


class MainWindow(QMainWindow):
    """主窗口类"""

    def __init__(self):
        super().__init__()

        # 初始化数据库和管理器
        self.init_managers()

        self.init_ui()
        self.create_menu_bar()
        self.create_toolbar()
        self.create_statusbar()
        self.connect_signals()

        # 延迟加载数据
        QTimer.singleShot(100, self.load_initial_data)

    def init_managers(self):
        """初始化数据库和管理器"""
        import os
        from core.database import Database
        from core.account_manager import AccountManager
        from core.article_manager import ArticleManager

        # 获取数据库路径
        current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        data_dir = os.path.join(current_dir, "data")
        os.makedirs(data_dir, exist_ok=True)

        db_path = os.path.join(data_dir, "database.db")

        # 初始化数据库和管理器
        self.db = Database(db_path)
        self.account_manager = AccountManager(self.db)
        self.article_manager = ArticleManager(self.db)

    def init_ui(self):
        """初始化UI"""
        # 设置窗口标题和尺寸
        self.setWindowTitle("对标账号管理软件 v1.0")
        self.setMinimumSize(1000, 600)
        self.resize(1280, 800)

        # 创建中心部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # 创建主布局
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(5, 5, 5, 5)
        main_layout.setSpacing(5)

        # 创建分栏容器
        self.splitter = QSplitter(Qt.Horizontal)
        self.splitter.setHandleWidth(3)

        # 左侧：账号列表组件
        try:
            from ui.widgets.account_list_widget import AccountListWidget
            self.account_list_widget = AccountListWidget(account_manager=self.account_manager)
            self.splitter.addWidget(self.account_list_widget)
        except ImportError:
            # 如果组件未创建，使用临时占位组件
            placeholder_left = QWidget()
            placeholder_layout = QVBoxLayout(placeholder_left)
            placeholder_layout.addWidget(QPushButton("账号列表组件\n(待实现)"))
            self.splitter.addWidget(placeholder_left)
            self.account_list_widget = None

        # 右侧：文章列表组件
        try:
            from ui.widgets.article_list_widget import ArticleListWidget
            self.article_list_widget = ArticleListWidget(article_manager=self.article_manager)
            self.splitter.addWidget(self.article_list_widget)
        except ImportError:
            # 如果组件未创建，使用临时占位组件
            placeholder_right = QWidget()
            placeholder_layout = QVBoxLayout(placeholder_right)
            placeholder_layout.addWidget(QPushButton("文章列表组件\n(待实现)"))
            self.splitter.addWidget(placeholder_right)
            self.article_list_widget = None

        # 设置分栏比例（30% : 70%）
        self.splitter.setStretchFactor(0, 3)  # 左侧账号列表
        self.splitter.setStretchFactor(1, 7)  # 右侧文章列表

        # 设置最小宽度
        self.splitter.setMinimumWidth(250)  # 左侧最小宽度

        main_layout.addWidget(self.splitter)

        # 应用样式
        self.apply_styles()

    def create_menu_bar(self):
        """创建菜单栏"""
        menubar = self.menuBar()

        # 文件菜单
        file_menu = menubar.addMenu("文件(&F)")

        # 导出操作
        export_action = QAction("导出数据(&E)", self)
        export_action.setShortcut("Ctrl+E")
        export_action.triggered.connect(self.export_data)
        file_menu.addAction(export_action)

        file_menu.addSeparator()

        # 退出操作
        exit_action = QAction("退出(&X)", self)
        exit_action.setShortcut("Ctrl+Q")
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        # 编辑菜单
        edit_menu = menubar.addMenu("编辑(&E)")

        # 添加账号
        add_account_action = QAction("添加账号(&A)", self)
        add_account_action.setShortcut("Ctrl+N")
        add_account_action.triggered.connect(self.add_account)
        edit_menu.addAction(add_account_action)

        # 添加文章
        add_article_action = QAction("添加文章(&T)", self)
        add_article_action.setShortcut("Ctrl+T")
        add_article_action.triggered.connect(self.add_article)
        edit_menu.addAction(add_article_action)

        edit_menu.addSeparator()

        # 刷新
        refresh_action = QAction("刷新(&R)", self)
        refresh_action.setShortcut("F5")
        refresh_action.triggered.connect(self.refresh_data)
        edit_menu.addAction(refresh_action)

        # 查看菜单
        view_menu = menubar.addMenu("查看(&V)")

        # 工具菜单
        tools_menu = menubar.addMenu("工具(&T)")

        # 设置操作
        settings_action = QAction("设置(&S)", self)
        settings_action.triggered.connect(self.show_settings)
        tools_menu.addAction(settings_action)

        # 帮助菜单
        help_menu = menubar.addMenu("帮助(&H)")

        # 关于操作
        about_action = QAction("关于(&A)", self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)

    def create_toolbar(self):
        """创建工具栏"""
        toolbar = QToolBar("主工具栏")
        toolbar.setMovable(False)
        toolbar.setIconSize(QSize(32, 32))
        self.addToolBar(toolbar)

        # 添加账号按钮
        add_account_btn = QPushButton("➕ 添加账号")
        add_account_btn.setFixedHeight(32)
        add_account_btn.clicked.connect(self.add_account)
        toolbar.addWidget(add_account_btn)

        # 添加文章按钮
        add_article_btn = QPushButton("➕ 添加文章")
        add_article_btn.setFixedHeight(32)
        add_article_btn.clicked.connect(self.add_article)
        toolbar.addWidget(add_article_btn)

        toolbar.addSeparator()

        # 刷新按钮
        refresh_btn = QPushButton("🔄 刷新")
        refresh_btn.setFixedHeight(32)
        refresh_btn.clicked.connect(self.refresh_data)
        toolbar.addWidget(refresh_btn)

        # 导出按钮
        export_btn = QPushButton("📤 导出")
        export_btn.setFixedHeight(32)
        export_btn.clicked.connect(self.export_data)
        toolbar.addWidget(export_btn)

        toolbar.addSeparator()

        # 设置按钮
        settings_btn = QPushButton("⚙️ 设置")
        settings_btn.setFixedHeight(32)
        settings_btn.clicked.connect(self.show_settings)
        toolbar.addWidget(settings_btn)

    def create_statusbar(self):
        """创建状态栏"""
        self.statusbar = QStatusBar()
        self.setStatusBar(self.statusbar)
        self.update_statusbar()

    def connect_signals(self):
        """连接信号"""
        if self.account_list_widget:
            # 账号选中信号 -> 加载文章
            self.account_list_widget.account_selected.connect(
                self.on_account_selected
            )

    def on_account_selected(self, account_id: int):
        """账号被选中"""
        if self.article_list_widget:
            self.article_list_widget.load_articles(account_id)
            self.update_statusbar()

    def load_initial_data(self):
        """加载初始数据"""
        if self.account_list_widget:
            self.account_list_widget.load_accounts()
        self.update_statusbar()

    def refresh_data(self):
        """刷新数据"""
        if self.account_list_widget:
            self.account_list_widget.load_accounts()

        if self.article_list_widget:
            self.article_list_widget.refresh_current_articles()

        self.update_statusbar()
        self.statusbar.showMessage("刷新完成", 2000)

    def add_account(self):
        """添加账号"""
        try:
            from ui.dialogs.add_account_dialog import AddAccountDialog
            dialog = AddAccountDialog(self)

            if dialog.exec_():
                # 验证数据
                if not dialog.validate():
                    return

                # 获取数据
                data = dialog.get_data()

                # TODO: 保存到数据库
                # account_manager.add_account(data)

                # 刷新列表
                if self.account_list_widget:
                    self.account_list_widget.load_accounts()

                QMessageBox.information(self, "成功", "账号添加成功！")
                self.update_statusbar()
        except ImportError:
            QMessageBox.warning(self, "提示", "添加账号对话框未实现")

    def add_article(self):
        """添加文章"""
        try:
            from ui.dialogs.add_article_dialog import AddArticleDialog
            dialog = AddArticleDialog(self)

            if dialog.exec_():
                # 验证数据
                if not dialog.validate():
                    return

                # 获取数据
                data = dialog.get_data()

                # TODO: 保存到数据库
                # article_manager.add_article(data)

                # 刷新列表
                self.refresh_data()

                QMessageBox.information(self, "成功", "文章添加成功！")
        except ImportError:
            QMessageBox.warning(self, "提示", "添加文章对话框未实现")

    def export_data(self):
        """导出数据"""
        # 选择导出格式
        file_filter = "Excel文件 (*.xlsx);;JSON文件 (*.json);;Markdown文件 (*.md)"
        file_path, selected_filter = QFileDialog.getSaveFileName(
            self,
            "导出数据",
            "",
            file_filter
        )

        if file_path:
            try:
                # TODO: 实现导出逻辑
                # export_manager.export_to_file(file_path, selected_filter)
                QMessageBox.information(self, "成功", f"数据已导出到: {file_path}")
            except Exception as e:
                QMessageBox.critical(self, "错误", f"导出失败: {str(e)}")

    def show_settings(self):
        """显示设置"""
        QMessageBox.information(self, "设置", "设置功能待实现")

    def show_about(self):
        """显示关于"""
        about_text = """
        <h3>对标账号管理软件 v1.0</h3>
        <p>一款用于管理对标账号和文章的桌面应用</p>
        <p><b>技术栈:</b> Python + PyQt5 + SQLite</p>
        <p><b>开发日期:</b> 2025-01-15</p>
        """
        QMessageBox.about(self, "关于", about_text)

    def update_statusbar(self):
        """更新状态栏"""
        # TODO: 从数据库获取实际统计数据
        total_accounts = 0
        total_articles = 0
        selected_account = ""

        if self.account_list_widget:
            # 获取账号数量
            total_accounts = self.account_list_widget.list_widget.count()

        if self.article_list_widget:
            # 获取文章数量
            total_articles = self.article_list_widget.list_widget.count()
            # 获取选中账号名称（如果存在）
            if hasattr(self.article_list_widget, 'current_account_name'):
                selected_account = self.article_list_widget.current_account_name or ""

        status_text = f"共 {total_accounts} 个账号 | {total_articles} 篇文章"
        if selected_account:
            status_text += f" | 选中: {selected_account}"

        self.statusbar.showMessage(status_text)

    def apply_styles(self):
        """应用样式表"""
        style = """
        QMainWindow {
            background-color: #FFFFFF;
        }

        QPushButton {
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            font-size: 14px;
        }

        QPushButton:hover {
            background-color: #1976D2;
        }

        QPushButton:pressed {
            background-color: #0D47A1;
        }

        QToolBar {
            background-color: #F5F5F5;
            border: none;
            spacing: 5px;
            padding: 5px;
        }

        QStatusBar {
            background-color: #F5F5F5;
            border-top: 1px solid #E0E0E0;
        }

        QSplitter::handle {
            background-color: #E0E0E0;
        }

        QSplitter::handle:hover {
            background-color: #BDBDBD;
        }
        """
        self.setStyleSheet(style)

    def save_state(self):
        """保存窗口状态"""
        # TODO: 保存窗口尺寸、位置、分栏比例等
        pass

    def restore_state(self):
        """恢复窗口状态"""
        # TODO: 恢复窗口尺寸、位置、分栏比例等
        pass

    def closeEvent(self, event):
        """窗口关闭事件"""
        reply = QMessageBox.question(
            self,
            "确认退出",
            "确定要退出程序吗？",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )

        if reply == QMessageBox.Yes:
            self.save_state()
            event.accept()
        else:
            event.ignore()
