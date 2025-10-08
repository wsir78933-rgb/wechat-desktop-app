"""
账号列表组件
负责展示账号列表、搜索、选择等功能
"""
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout,
    QListWidget, QListWidgetItem, QLineEdit,
    QPushButton, QMenu, QMessageBox
)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont, QKeyEvent


class AccountListWidget(QWidget):
    """账号列表组件"""

    # 定义信号
    account_selected = pyqtSignal(int)  # 账号ID
    account_deleted = pyqtSignal(int)   # 账号被删除
    account_edited = pyqtSignal(int)    # 账号被编辑

    def __init__(self, account_manager=None):
        """
        初始化账号列表组件

        Args:
            account_manager: 账号管理器实例(可选,用于mock数据测试)
        """
        super().__init__()
        self.account_manager = account_manager
        self.current_account_id = None
        self.all_accounts = []  # 存储所有账号数据
        self.init_ui()

    def init_ui(self):
        """初始化UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)
        layout.setSpacing(8)

        # 标题栏
        title_layout = QHBoxLayout()
        title_label = QLineEdit()
        title_label.setText("账号列表 (0)")
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

        # 搜索框
        self.search_box = QLineEdit()
        self.search_box.setPlaceholderText("🔍 搜索账号...")
        self.search_box.textChanged.connect(self.filter_accounts)
        layout.addWidget(self.search_box)

        # 账号列表
        self.list_widget = QListWidget()
        self.list_widget.itemClicked.connect(self.on_item_clicked)
        self.list_widget.setContextMenuPolicy(Qt.CustomContextMenu)
        self.list_widget.customContextMenuRequested.connect(self.show_context_menu)
        layout.addWidget(self.list_widget)

        # 操作按钮
        btn_layout = QHBoxLayout()
        self.edit_btn = QPushButton("📝 编辑")
        self.edit_btn.setFixedHeight(32)
        self.delete_btn = QPushButton("🗑️ 删除")
        self.delete_btn.setFixedHeight(32)

        self.edit_btn.clicked.connect(self.on_edit_clicked)
        self.delete_btn.clicked.connect(self.on_delete_clicked)

        # 初始状态禁用按钮
        self.edit_btn.setEnabled(False)
        self.delete_btn.setEnabled(False)

        btn_layout.addWidget(self.edit_btn)
        btn_layout.addWidget(self.delete_btn)
        layout.addLayout(btn_layout)

        self.title_label = title_label

    def load_accounts(self):
        """加载账号列表"""
        self.list_widget.clear()

        if self.account_manager:
            try:
                # 从Manager获取真实数据
                accounts = self.account_manager.get_all_accounts()
                self.all_accounts = accounts
            except Exception as e:
                print(f"加载账号失败: {e}")
                self.all_accounts = self._get_mock_accounts()
        else:
            # 使用mock数据
            self.all_accounts = self._get_mock_accounts()

        # 更新标题
        self.title_label.setText(f"账号列表 ({len(self.all_accounts)})")

        # 显示账号
        for account in self.all_accounts:
            self._add_account_item(account)

    def _get_mock_accounts(self):
        """获取mock数据（用于测试）"""
        return [
            {
                'id': 1,
                'name': '张三',
                'category': '科技',
                'description': '专注于AI和机器学习领域的技术分享',
                'article_count': 15,
                'latest_date': '2025-01-15'
            },
            {
                'id': 2,
                'name': '李四',
                'category': '营销',
                'description': '数字营销和增长黑客实战经验',
                'article_count': 8,
                'latest_date': '2025-01-12'
            },
            {
                'id': 3,
                'name': '王五',
                'category': '运营',
                'description': '用户运营和社群运营方法论',
                'article_count': 12,
                'latest_date': '2024-12-28'
            },
        ]

    def _add_account_item(self, account: dict):
        """
        添加账号项到列表

        Args:
            account: 账号数据字典
        """
        item = QListWidgetItem()
        item.setData(Qt.UserRole, account['id'])

        # 格式化显示文本
        article_count = account.get('article_count', 0)
        latest_date = account.get('latest_date', '暂无')

        text = f"👤 {account['name']}\n"
        text += f"   {account['category']} | {article_count}篇\n"
        text += f"   最新: {latest_date}"

        item.setText(text)

        # 设置字体
        font = QFont()
        font.setPointSize(10)
        item.setFont(font)

        self.list_widget.addItem(item)

    def filter_accounts(self, text: str):
        """
        过滤账号列表

        Args:
            text: 搜索文本
        """
        search_text = text.lower().strip()

        for i in range(self.list_widget.count()):
            item = self.list_widget.item(i)
            account_id = item.data(Qt.UserRole)

            # 查找对应的账号数据
            account = next((a for a in self.all_accounts if a['id'] == account_id), None)

            if not account:
                item.setHidden(True)
                continue

            # 搜索账号名称、分类、描述
            if search_text:
                name_match = search_text in account.get('name', '').lower()
                category_match = search_text in account.get('category', '').lower()
                desc_match = search_text in account.get('description', '').lower()

                item.setHidden(not (name_match or category_match or desc_match))
            else:
                item.setHidden(False)

    def on_item_clicked(self, item: QListWidgetItem):
        """
        账号项被点击

        Args:
            item: 被点击的项
        """
        account_id = item.data(Qt.UserRole)
        self.current_account_id = account_id

        # 启用操作按钮
        self.edit_btn.setEnabled(True)
        self.delete_btn.setEnabled(True)

        # 发送信号
        self.account_selected.emit(account_id)

    def show_context_menu(self, pos):
        """
        显示右键菜单

        Args:
            pos: 鼠标位置
        """
        item = self.list_widget.itemAt(pos)
        if not item:
            return

        account_id = item.data(Qt.UserRole)
        self.current_account_id = account_id

        # 创建菜单
        menu = QMenu(self)

        edit_action = menu.addAction("📝 编辑账号信息")
        add_article_action = menu.addAction("➕ 为此账号添加文章")
        menu.addSeparator()
        export_action = menu.addAction("📤 导出该账号文章")
        menu.addSeparator()
        delete_action = menu.addAction("🗑️ 删除该账号")

        # 连接信号
        edit_action.triggered.connect(self.on_edit_clicked)
        delete_action.triggered.connect(self.on_delete_clicked)

        # 显示菜单
        menu.exec_(self.list_widget.mapToGlobal(pos))

    def on_edit_clicked(self):
        """编辑按钮被点击"""
        if self.current_account_id:
            self.account_edited.emit(self.current_account_id)

    def on_delete_clicked(self):
        """删除按钮被点击"""
        if not self.current_account_id:
            return

        # 获取账号信息
        account = next((a for a in self.all_accounts if a['id'] == self.current_account_id), None)
        if not account:
            return

        # 确认删除
        account_name = account['name']
        article_count = account.get('article_count', 0)
        message = (
            f"确定要删除账号 {account_name} 及其所有文章吗？\n\n"
            f"该账号共有 {article_count} 篇文章\n"
            f"此操作无法恢复！"
        )
        reply = QMessageBox.question(
            self,
            '确认删除',
            message,
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )

        if reply == QMessageBox.Yes:
            try:
                if self.account_manager:
                    # 调用Manager删除
                    success = self.account_manager.delete_account(self.current_account_id)
                    if not success:
                        QMessageBox.warning(self, "错误", "删除账号失败！")
                        return

                # 发送删除信号
                self.account_deleted.emit(self.current_account_id)

                # 刷新列表
                self.load_accounts()

                # 清除选中状态
                self.current_account_id = None
                self.edit_btn.setEnabled(False)
                self.delete_btn.setEnabled(False)

                QMessageBox.information(self, "成功", "账号已删除！")

            except Exception as e:
                QMessageBox.critical(self, "错误", f"删除账号时出错：{str(e)}")

    def get_selected_account_id(self):
        """
        获取当前选中的账号ID

        Returns:
            int: 账号ID，如果未选中则返回None
        """
        return self.current_account_id

    def refresh(self):
        """刷新列表"""
        self.load_accounts()

    def clear_selection(self):
        """清除选中状态"""
        self.list_widget.clearSelection()
        self.current_account_id = None
        self.edit_btn.setEnabled(False)
        self.delete_btn.setEnabled(False)

    def keyPressEvent(self, event: QKeyEvent):
        """
        处理键盘事件

        Args:
            event: 键盘事件
        """
        # 按下 Delete 键时删除选中的账号
        if event.key() == Qt.Key_Delete:
            if self.current_account_id:
                self.on_delete_clicked()
            event.accept()
        else:
            # 其他按键交给父类处理
            super().keyPressEvent(event)
