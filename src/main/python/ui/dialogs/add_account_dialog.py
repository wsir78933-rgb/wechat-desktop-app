"""
添加账号对话框
用于添加和编辑账号信息
"""
from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout,
    QFormLayout, QLineEdit, QTextEdit,
    QComboBox, QPushButton, QMessageBox, QLabel
)
from PyQt5.QtCore import Qt


class AddAccountDialog(QDialog):
    """添加/编辑账号对话框"""

    def __init__(self, parent=None, account_data=None):
        """
        初始化对话框

        Args:
            parent: 父窗口
            account_data: 账号数据(编辑模式时传入)
        """
        super().__init__(parent)
        self.account_data = account_data
        self.is_edit_mode = account_data is not None
        self.init_ui()

        # 如果是编辑模式,填充数据
        if self.is_edit_mode:
            self.load_data()

    def init_ui(self):
        """初始化UI"""
        # 设置窗口标题和大小
        title = "编辑账号" if self.is_edit_mode else "添加账号"
        self.setWindowTitle(title)
        self.setFixedSize(450, 500)

        # 主布局
        main_layout = QVBoxLayout(self)
        main_layout.setSpacing(15)

        # 表单布局
        form_layout = QFormLayout()
        form_layout.setSpacing(12)

        # 账号名称/作者名
        name_label = QLabel("账号名称/作者名 *")
        name_label.setStyleSheet("font-weight: bold;")

        self.name_input = QLineEdit()
        self.name_input.setPlaceholderText("例如: 张三")

        name_hint = QLabel("💡 这个名称将作为该账号下所有文章的作者名显示")
        name_hint.setStyleSheet("color: #666666; font-size: 12px;")
        name_hint.setWordWrap(True)

        form_layout.addRow(name_label, self.name_input)
        form_layout.addRow("", name_hint)

        # 账号分类
        category_label = QLabel("账号分类 *")
        category_label.setStyleSheet("font-weight: bold;")

        category_container = QVBoxLayout()
        self.category_combo = QComboBox()
        self.category_combo.setEditable(True)  # 可编辑,支持自定义分类
        self.category_combo.addItems(["科技", "营销", "运营", "设计", "产品", "其他"])
        category_container.addWidget(self.category_combo)

        # 常用分类快捷按钮
        category_btn_layout = QHBoxLayout()
        category_btn_layout.setSpacing(5)

        category_hint = QLabel("常用分类:")
        category_hint.setStyleSheet("color: #666666; font-size: 12px;")
        category_btn_layout.addWidget(category_hint)

        common_categories = ["科技", "营销", "运营", "设计"]
        for cat in common_categories:
            btn = QPushButton(cat)
            btn.setFixedHeight(25)
            btn.setStyleSheet("""
                QPushButton {
                    background-color: #E3F2FD;
                    color: #1976D2;
                    border: 1px solid #2196F3;
                    border-radius: 3px;
                    padding: 3px 10px;
                    font-size: 12px;
                }
                QPushButton:hover {
                    background-color: #BBDEFB;
                }
            """)
            btn.clicked.connect(lambda checked, c=cat: self.category_combo.setCurrentText(c))
            category_btn_layout.addWidget(btn)

        category_btn_layout.addStretch()
        category_container.addLayout(category_btn_layout)

        form_layout.addRow(category_label, category_container)

        # 账号描述
        desc_label = QLabel("账号描述")

        self.desc_input = QTextEdit()
        self.desc_input.setPlaceholderText("例如: 专注于AI和机器学习领域的技术分享")
        self.desc_input.setMaximumHeight(80)

        form_layout.addRow(desc_label, self.desc_input)

        # 头像链接
        avatar_label = QLabel("头像链接 (可选)")

        self.avatar_input = QLineEdit()
        self.avatar_input.setPlaceholderText("例如: https://example.com/avatar.jpg")

        form_layout.addRow(avatar_label, self.avatar_input)

        main_layout.addLayout(form_layout)

        # 必填提示
        required_hint = QLabel("* 为必填项")
        required_hint.setStyleSheet("color: #F44336; font-size: 12px;")
        main_layout.addWidget(required_hint)

        main_layout.addStretch()

        # 按钮布局
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()

        self.ok_btn = QPushButton("确定")
        self.ok_btn.setFixedWidth(100)
        self.ok_btn.setStyleSheet("""
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
        """)

        self.cancel_btn = QPushButton("取消")
        self.cancel_btn.setFixedWidth(100)
        self.cancel_btn.setStyleSheet("""
            QPushButton {
                background-color: #FFFFFF;
                color: #666666;
                border: 1px solid #E0E0E0;
                border-radius: 4px;
                padding: 8px 16px;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #F5F5F5;
            }
        """)

        self.ok_btn.clicked.connect(self.on_ok_clicked)
        self.cancel_btn.clicked.connect(self.reject)

        btn_layout.addWidget(self.ok_btn)
        btn_layout.addWidget(self.cancel_btn)
        main_layout.addLayout(btn_layout)

    def load_data(self):
        """加载数据(编辑模式)"""
        if not self.account_data:
            return

        self.name_input.setText(self.account_data.get('name', ''))
        self.category_combo.setCurrentText(self.account_data.get('category', ''))
        self.desc_input.setPlainText(self.account_data.get('description', ''))
        self.avatar_input.setText(self.account_data.get('avatar_url', ''))

    def validate(self) -> bool:
        """
        验证输入数据

        Returns:
            bool: 验证是否通过
        """
        # 验证账号名称
        name = self.name_input.text().strip()
        if not name:
            QMessageBox.warning(self, "验证失败", "账号名称不能为空！")
            self.name_input.setFocus()
            return False

        if len(name) > 50:
            QMessageBox.warning(self, "验证失败", "账号名称不能超过50个字符！")
            self.name_input.setFocus()
            return False

        # 验证账号分类
        category = self.category_combo.currentText().strip()
        if not category:
            QMessageBox.warning(self, "验证失败", "账号分类不能为空！")
            self.category_combo.setFocus()
            return False

        if len(category) > 20:
            QMessageBox.warning(self, "验证失败", "账号分类不能超过20个字符！")
            self.category_combo.setFocus()
            return False

        # 验证描述长度
        description = self.desc_input.toPlainText().strip()
        if len(description) > 500:
            QMessageBox.warning(self, "验证失败", "账号描述不能超过500个字符！")
            self.desc_input.setFocus()
            return False

        # 验证头像链接
        avatar_url = self.avatar_input.text().strip()
        if avatar_url and not self._validate_url(avatar_url):
            reply = QMessageBox.question(
                self,
                "URL格式警告",
                "头像链接格式可能不正确，是否继续？",
                QMessageBox.Yes | QMessageBox.No,
                QMessageBox.No
            )
            if reply == QMessageBox.No:
                self.avatar_input.setFocus()
                return False

        return True

    def _validate_url(self, url: str) -> bool:
        """
        简单的URL验证

        Args:
            url: URL字符串

        Returns:
            bool: 是否有效
        """
        return url.startswith(('http://', 'https://'))

    def get_data(self) -> dict:
        """
        获取输入数据

        Returns:
            dict: 账号数据
        """
        return {
            'name': self.name_input.text().strip(),
            'category': self.category_combo.currentText().strip(),
            'description': self.desc_input.toPlainText().strip(),
            'avatar_url': self.avatar_input.text().strip()
        }

    def on_ok_clicked(self):
        """确定按钮被点击"""
        if self.validate():
            self.accept()

    @staticmethod
    def get_account_data(parent=None, account_data=None):
        """
        静态方法:显示对话框并返回数据

        Args:
            parent: 父窗口
            account_data: 账号数据(编辑模式)

        Returns:
            tuple: (是否确认, 账号数据)
        """
        dialog = AddAccountDialog(parent, account_data)
        result = dialog.exec_()

        if result == QDialog.Accepted:
            return True, dialog.get_data()
        else:
            return False, None
