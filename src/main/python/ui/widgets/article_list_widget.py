"""
文章列表组件
负责展示文章列表、搜索、筛选、批量操作等功能
"""
import webbrowser
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout,
    QListWidget, QListWidgetItem, QLineEdit,
    QPushButton, QComboBox, QMenu, QMessageBox,
    QAbstractItemView
)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont


class ArticleListWidget(QWidget):
    """文章列表组件"""

    # 定义信号
    article_deleted = pyqtSignal(int)   # 文章被删除
    article_edited = pyqtSignal(int)    # 文章被编辑

    def __init__(self, article_manager=None):
        """
        初始化文章列表组件

        Args:
            article_manager: 文章管理器实例(可选,用于mock数据测试)
        """
        super().__init__()
        self.article_manager = article_manager
        self.current_account_id = None
        self.all_articles = []  # 存储所有文章数据
        self.init_ui()

    def init_ui(self):
        """初始化UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)
        layout.setSpacing(8)

        # 标题栏
        title_layout = QHBoxLayout()
        title_label = QLineEdit()
        title_label.setText("文章列表 (0)")
        title_label.setReadOnly(True)
        title_label.setStyleSheet("""
            QLineEdit {
                border: none;
                background-color: transparent;
                font-size: 16px;
                font-weight: bold;
                color: #333333;
            }
        """)
        title_layout.addWidget(title_label)
        layout.addLayout(title_layout)

        # 搜索和筛选栏
        search_layout = QHBoxLayout()

        self.search_box = QLineEdit()
        self.search_box.setPlaceholderText("🔍 搜索文章...")
        self.search_box.textChanged.connect(self.filter_articles)

        self.sort_combo = QComboBox()
        self.sort_combo.addItems(["排序:时间↓", "排序:时间↑", "排序:标题"])
        self.sort_combo.setFixedWidth(120)
        self.sort_combo.currentIndexChanged.connect(self.sort_articles)

        search_layout.addWidget(self.search_box, stretch=1)
        search_layout.addWidget(self.sort_combo)
        layout.addLayout(search_layout)

        # 文章列表
        self.list_widget = QListWidget()
        self.list_widget.setSelectionMode(QAbstractItemView.ExtendedSelection)  # 支持多选
        self.list_widget.itemDoubleClicked.connect(self.open_article)
        self.list_widget.setContextMenuPolicy(Qt.CustomContextMenu)
        self.list_widget.customContextMenuRequested.connect(self.show_context_menu)
        layout.addWidget(self.list_widget)

        # 批量操作按钮
        btn_layout = QHBoxLayout()

        self.select_all_btn = QPushButton("全选")
        self.select_all_btn.clicked.connect(self.select_all)
        self.select_all_btn.setFixedHeight(32)

        self.batch_delete_btn = QPushButton("🗑️ 批量删除")
        self.batch_delete_btn.clicked.connect(self.batch_delete)
        self.batch_delete_btn.setEnabled(False)
        self.batch_delete_btn.setFixedHeight(32)

        self.export_btn = QPushButton("📤 导出选中")
        self.export_btn.clicked.connect(self.export_selected)
        self.export_btn.setEnabled(False)
        self.export_btn.setFixedHeight(32)

        btn_layout.addWidget(self.select_all_btn)
        btn_layout.addWidget(self.batch_delete_btn)
        btn_layout.addWidget(self.export_btn)
        layout.addLayout(btn_layout)

        # 选中数量提示
        self.selection_label = QLineEdit()
        self.selection_label.setReadOnly(True)
        self.selection_label.setText("未选中任何文章")
        self.selection_label.setStyleSheet("""
            QLineEdit {
                border: none;
                background-color: transparent;
                color: #666666;
                font-size: 12px;
            }
        """)
        layout.addWidget(self.selection_label)

        # 连接选中改变信号
        self.list_widget.itemSelectionChanged.connect(self.on_selection_changed)

        self.title_label = title_label

    def load_articles(self, account_id: int):
        """
        加载指定账号的文章列表

        Args:
            account_id: 账号ID
        """
        self.current_account_id = account_id
        self.list_widget.clear()

        if self.article_manager:
            try:
                # 从Manager获取真实数据
                articles = self.article_manager.get_articles_by_account(account_id)
                self.all_articles = articles
            except Exception as e:
                print(f"加载文章失败: {e}")
                self.all_articles = self._get_mock_articles(account_id)
        else:
            # 使用mock数据
            self.all_articles = self._get_mock_articles(account_id)

        # 更新标题
        self.title_label.setText(f"文章列表 ({len(self.all_articles)})")

        # 显示文章
        for article in self.all_articles:
            self._add_article_item(article)

    def _get_mock_articles(self, account_id: int):
        """获取mock数据（用于测试）"""
        # 根据不同账号返回不同的mock数据
        if account_id == 1:
            return [
                {
                    'id': 1,
                    'title': 'AI技术的未来发展趋势',
                    'url': 'https://mp.weixin.qq.com/s/xxxxx1',
                    'publish_date': '2025-01-15',
                    'author': '张三',
                    'tags': 'AI, 技术',
                    'summary': '本文探讨了AI技术在未来的发展方向...'
                },
                {
                    'id': 2,
                    'title': '大模型应用案例分析',
                    'url': 'https://mp.weixin.qq.com/s/xxxxx2',
                    'publish_date': '2025-01-10',
                    'author': '张三',
                    'tags': 'GPT, 应用',
                    'summary': '分享几个大模型的实际应用案例...'
                },
                {
                    'id': 3,
                    'title': '深度学习入门指南',
                    'url': 'https://mp.weixin.qq.com/s/xxxxx3',
                    'publish_date': '2025-01-05',
                    'author': '张三',
                    'tags': '深度学习, 教程',
                    'summary': '从零开始学习深度学习...'
                },
            ]
        elif account_id == 2:
            return [
                {
                    'id': 4,
                    'title': '数字营销的10个技巧',
                    'url': 'https://mp.weixin.qq.com/s/xxxxx4',
                    'publish_date': '2025-01-12',
                    'author': '李四',
                    'tags': '营销, 技巧',
                    'summary': '分享数字营销的实战技巧...'
                },
            ]
        else:
            return []

    def _add_article_item(self, article: dict):
        """
        添加文章项到列表

        Args:
            article: 文章数据字典
        """
        item = QListWidgetItem()
        item.setData(Qt.UserRole, article['id'])
        item.setData(Qt.UserRole + 1, article.get('url', ''))  # 存储URL

        # 格式化显示文本
        text = f"📄 {article['title']}\n"
        text += f"   {article.get('publish_date', '未知')} | {article.get('author', '未知')}"

        tags = article.get('tags', '').strip()
        if tags:
            text += f"\n   🏷️ {tags}"

        item.setText(text)

        # 设置字体
        font = QFont()
        font.setPointSize(10)
        item.setFont(font)

        self.list_widget.addItem(item)

    def filter_articles(self, text: str):
        """
        过滤文章列表

        Args:
            text: 搜索文本
        """
        search_text = text.lower().strip()

        for i in range(self.list_widget.count()):
            item = self.list_widget.item(i)
            article_id = item.data(Qt.UserRole)

            # 查找对应的文章数据
            article = next((a for a in self.all_articles if a['id'] == article_id), None)

            if not article:
                item.setHidden(True)
                continue

            # 搜索标题、标签、摘要
            if search_text:
                title_match = search_text in article.get('title', '').lower()
                tags_match = search_text in article.get('tags', '').lower()
                summary_match = search_text in article.get('summary', '').lower()

                item.setHidden(not (title_match or tags_match or summary_match))
            else:
                item.setHidden(False)

    def sort_articles(self, index: int):
        """
        排序文章列表

        Args:
            index: 排序方式索引
        """
        if not self.all_articles:
            return

        # 根据选择的排序方式进行排序
        if index == 0:  # 时间降序
            self.all_articles.sort(key=lambda x: x.get('publish_date', ''), reverse=True)
        elif index == 1:  # 时间升序
            self.all_articles.sort(key=lambda x: x.get('publish_date', ''))
        elif index == 2:  # 标题
            self.all_articles.sort(key=lambda x: x.get('title', ''))

        # 重新加载列表
        self.list_widget.clear()
        for article in self.all_articles:
            self._add_article_item(article)

    def open_article(self, item: QListWidgetItem):
        """
        打开文章链接

        Args:
            item: 文章项
        """
        url = item.data(Qt.UserRole + 1)
        if url:
            try:
                webbrowser.open(url)
            except Exception as e:
                QMessageBox.warning(self, "错误", f"无法打开链接：{str(e)}")
        else:
            QMessageBox.warning(self, "错误", "文章链接无效！")

    def show_context_menu(self, pos):
        """
        显示右键菜单

        Args:
            pos: 鼠标位置
        """
        item = self.list_widget.itemAt(pos)
        if not item:
            return

        # 创建菜单
        menu = QMenu(self)

        open_action = menu.addAction("🔗 在浏览器中打开")
        copy_action = menu.addAction("📋 复制文章链接")
        menu.addSeparator()
        edit_action = menu.addAction("📝 编辑文章信息")
        menu.addSeparator()
        delete_action = menu.addAction("🗑️ 删除此文章")

        # 连接信号
        open_action.triggered.connect(lambda: self.open_article(item))
        copy_action.triggered.connect(lambda: self.copy_url(item))
        edit_action.triggered.connect(lambda: self.edit_article(item))
        delete_action.triggered.connect(lambda: self.delete_article(item))

        # 显示菜单
        menu.exec_(self.list_widget.mapToGlobal(pos))

    def copy_url(self, item: QListWidgetItem):
        """
        复制文章链接

        Args:
            item: 文章项
        """
        from PyQt5.QtWidgets import QApplication
        url = item.data(Qt.UserRole + 1)
        if url:
            QApplication.clipboard().setText(url)
            QMessageBox.information(self, "成功", "链接已复制到剪贴板！")

    def edit_article(self, item: QListWidgetItem):
        """
        编辑文章

        Args:
            item: 文章项
        """
        article_id = item.data(Qt.UserRole)
        self.article_edited.emit(article_id)

    def delete_article(self, item: QListWidgetItem):
        """
        删除文章

        Args:
            item: 文章项
        """
        article_id = item.data(Qt.UserRole)

        # 获取文章信息
        article = next((a for a in self.all_articles if a['id'] == article_id), None)
        if not article:
            return

        # 确认删除
        article_title = article['title']
        message = f"确定要删除文章 {article_title} 吗？\n\n此操作无法恢复！"
        reply = QMessageBox.question(
            self,
            '确认删除',
            message,
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )

        if reply == QMessageBox.Yes:
            try:
                if self.article_manager:
                    # 调用Manager删除
                    success = self.article_manager.delete_article(article_id)
                    if not success:
                        QMessageBox.warning(self, "错误", "删除文章失败！")
                        return

                # 发送删除信号
                self.article_deleted.emit(article_id)

                # 刷新列表
                if self.current_account_id:
                    self.load_articles(self.current_account_id)

                QMessageBox.information(self, "成功", "文章已删除！")

            except Exception as e:
                QMessageBox.critical(self, "错误", f"删除文章时出错：{str(e)}")

    def on_selection_changed(self):
        """选中状态改变"""
        selected_count = len(self.list_widget.selectedItems())

        if selected_count > 0:
            self.selection_label.setText(f"已选中 {selected_count} 篇文章")
            self.batch_delete_btn.setEnabled(True)
            self.export_btn.setEnabled(True)
        else:
            self.selection_label.setText("未选中任何文章")
            self.batch_delete_btn.setEnabled(False)
            self.export_btn.setEnabled(False)

    def select_all(self):
        """全选/取消全选"""
        if self.list_widget.count() == 0:
            return

        # 如果已经全选,则取消全选
        if len(self.list_widget.selectedItems()) == self.list_widget.count():
            self.list_widget.clearSelection()
            self.select_all_btn.setText("全选")
        else:
            self.list_widget.selectAll()
            self.select_all_btn.setText("取消全选")

    def batch_delete(self):
        """批量删除选中的文章"""
        selected_items = self.list_widget.selectedItems()
        if not selected_items:
            return

        # 确认删除
        reply = QMessageBox.question(
            self,
            '确认批量删除',
            f"确定要删除选中的 {len(selected_items)} 篇文章吗？\n\n此操作无法恢复！",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )

        if reply == QMessageBox.Yes:
            try:
                deleted_count = 0
                for item in selected_items:
                    article_id = item.data(Qt.UserRole)

                    if self.article_manager:
                        success = self.article_manager.delete_article(article_id)
                        if success:
                            deleted_count += 1
                    else:
                        deleted_count += 1

                # 刷新列表
                if self.current_account_id:
                    self.load_articles(self.current_account_id)

                QMessageBox.information(self, "成功", f"已删除 {deleted_count} 篇文章！")

            except Exception as e:
                QMessageBox.critical(self, "错误", f"批量删除时出错：{str(e)}")

    def export_selected(self):
        """导出选中的文章"""
        selected_items = self.list_widget.selectedItems()
        if not selected_items:
            return

        QMessageBox.information(
            self,
            "提示",
            f"导出功能开发中...\n将导出 {len(selected_items)} 篇文章"
        )

    def clear(self):
        """清空列表"""
        self.list_widget.clear()
        self.all_articles = []
        self.current_account_id = None
        self.title_label.setText("文章列表 (0)")
        self.selection_label.setText("未选中任何文章")

    def refresh_current_articles(self):
        """刷新当前账号的文章列表"""
        if self.current_account_id:
            self.load_articles(self.current_account_id)

    def show_empty_message(self):
        """显示空状态提示"""
        self.clear()
        item = QListWidgetItem()
        item.setText("💡 请在左侧选择一个账号以查看文章列表")
        item.setFlags(Qt.NoItemFlags)  # 不可选中
        font = QFont()
        font.setPointSize(12)
        item.setFont(font)
        self.list_widget.addItem(item)
