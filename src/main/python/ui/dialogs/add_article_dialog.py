"""
添加文章对话框
用于添加和编辑文章信息
"""
from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout,
    QFormLayout, QLineEdit, QTextEdit,
    QComboBox, QPushButton, QMessageBox, QLabel,
    QCheckBox, QDateEdit
)
from PyQt5.QtCore import Qt, QDate
import re


class AddArticleDialog(QDialog):
    """添加/编辑文章对话框"""

    def __init__(self, parent=None, article_data=None, accounts=None):
        """
        初始化对话框

        Args:
            parent: 父窗口
            article_data: 文章数据(编辑模式时传入)
            accounts: 账号列表
        """
        super().__init__(parent)
        self.article_data = article_data
        self.accounts = accounts or []
        self.is_edit_mode = article_data is not None
        self.continue_adding = False
        self.init_ui()

        # 如果是编辑模式,填充数据
        if self.is_edit_mode:
            self.load_data()

    def init_ui(self):
        """初始化UI"""
        # 设置窗口标题和大小
        title = "编辑文章" if self.is_edit_mode else "添加文章"
        self.setWindowTitle(title)
        self.setFixedSize(550, 750)

        # 主布局
        main_layout = QVBoxLayout(self)
        main_layout.setSpacing(15)

        # 表单布局
        form_layout = QFormLayout()
        form_layout.setSpacing(12)

        # 选择账号/作者
        account_label = QLabel("选择账号/作者 *")
        account_label.setStyleSheet("font-weight: bold;")

        self.account_combo = QComboBox()
        self.account_combo.setEditable(True)  # 支持搜索
        self._load_accounts()

        form_layout.addRow(account_label, self.account_combo)

        # 文章标题
        title_label = QLabel("文章标题 *")
        title_label.setStyleSheet("font-weight: bold;")

        self.title_input = QLineEdit()
        self.title_input.setPlaceholderText("例如: AI技术的未来发展趋势")

        form_layout.addRow(title_label, self.title_input)

        # 文章链接
        url_label = QLabel("文章链接 *")
        url_label.setStyleSheet("font-weight: bold;")

        url_container = QVBoxLayout()
        self.url_input = QLineEdit()
        self.url_input.setPlaceholderText("例如: https://mp.weixin.qq.com/s/xxxxxxxx")
        self.url_input.textChanged.connect(self.validate_url_realtime)
        url_container.addWidget(self.url_input)

        # URL验证提示
        self.url_status_label = QLabel("")
        self.url_status_label.setStyleSheet("font-size: 12px;")
        url_container.addWidget(self.url_status_label)

        form_layout.addRow(url_label, url_container)

        # 发布日期
        date_label = QLabel("发布日期")

        self.date_edit = QDateEdit()
        self.date_edit.setCalendarPopup(True)
        self.date_edit.setDate(QDate.currentDate())
        self.date_edit.setDisplayFormat("yyyy-MM-dd")

        form_layout.addRow(date_label, self.date_edit)

        # 文章作者
        author_label = QLabel("文章作者")

        self.author_input = QLineEdit()
        self.author_input.setPlaceholderText("默认使用账号名称")

        form_layout.addRow(author_label, self.author_input)

        # 标签
        tags_label = QLabel("标签 (用逗号分隔)")

        tags_container = QVBoxLayout()
        self.tags_input = QLineEdit()
        self.tags_input.setPlaceholderText("例如: AI, 技术, 深度学习")
        tags_container.addWidget(self.tags_input)

        # 常用标签快捷按钮
        tags_btn_layout = QHBoxLayout()
        tags_btn_layout.setSpacing(5)

        tags_hint = QLabel("常用标签:")
        tags_hint.setStyleSheet("color: #666666; font-size: 12px;")
        tags_btn_layout.addWidget(tags_hint)

        common_tags = ["AI", "营销", "运营", "设计", "技术"]
        for tag in common_tags:
            btn = QPushButton(tag)
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
            btn.clicked.connect(lambda checked, t=tag: self.add_tag(t))
            tags_btn_layout.addWidget(btn)

        tags_btn_layout.addStretch()
        tags_container.addLayout(tags_btn_layout)

        form_layout.addRow(tags_label, tags_container)

        # 文章摘要
        summary_label = QLabel("文章摘要 (可选)")

        self.summary_input = QTextEdit()
        self.summary_input.setPlaceholderText("例如: 本文探讨了AI技术在未来的发展方向...")
        self.summary_input.setMaximumHeight(100)

        form_layout.addRow(summary_label, self.summary_input)

        # 封面图链接
        cover_label = QLabel("封面图链接 (可选)")

        self.cover_input = QLineEdit()
        self.cover_input.setPlaceholderText("例如: https://example.com/cover.jpg")

        form_layout.addRow(cover_label, self.cover_input)

        main_layout.addLayout(form_layout)

        # 必填提示
        required_hint = QLabel("* 为必填项")
        required_hint.setStyleSheet("color: #F44336; font-size: 12px;")
        main_layout.addWidget(required_hint)

        main_layout.addStretch()

        # "添加后继续添加"选项(仅在添加模式显示)
        if not self.is_edit_mode:
            self.continue_checkbox = QCheckBox("☑ 添加后继续添加")
            self.continue_checkbox.setStyleSheet("font-size: 13px;")
            main_layout.addWidget(self.continue_checkbox)

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

    def _load_accounts(self):
        """加载账号列表到下拉框"""
        self.account_combo.clear()

        if not self.accounts:
            # 如果没有账号数据,添加提示
            self.account_combo.addItem("暂无账号,请先添加账号")
            self.account_combo.setEnabled(False)
            return

        for account in self.accounts:
            # 格式: "张三 (科技类)"
            display_text = f"{account['name']} ({account.get('category', '未分类')})"
            self.account_combo.addItem(display_text, account['id'])

    def load_data(self):
        """加载数据(编辑模式)"""
        if not self.article_data:
            return

        # 设置账号
        account_id = self.article_data.get('account_id')
        for i in range(self.account_combo.count()):
            if self.account_combo.itemData(i) == account_id:
                self.account_combo.setCurrentIndex(i)
                break

        # 设置其他字段
        self.title_input.setText(self.article_data.get('title', ''))
        self.url_input.setText(self.article_data.get('url', ''))

        # 设置日期
        publish_date = self.article_data.get('publish_date', '')
        if publish_date:
            date = QDate.fromString(publish_date, "yyyy-MM-dd")
            if date.isValid():
                self.date_edit.setDate(date)

        self.author_input.setText(self.article_data.get('author', ''))
        self.tags_input.setText(self.article_data.get('tags', ''))
        self.summary_input.setPlainText(self.article_data.get('summary', ''))
        self.cover_input.setText(self.article_data.get('cover_image', ''))

    def add_tag(self, tag: str):
        """
        添加标签

        Args:
            tag: 标签文本
        """
        current_tags = self.tags_input.text().strip()
        if current_tags:
            # 已有标签,追加
            tags_list = [t.strip() for t in current_tags.split(',')]
            if tag not in tags_list:
                tags_list.append(tag)
                self.tags_input.setText(', '.join(tags_list))
        else:
            # 没有标签,直接设置
            self.tags_input.setText(tag)

    def validate_url_realtime(self, text: str):
        """
        实时验证URL格式

        Args:
            text: URL文本
        """
        if not text.strip():
            self.url_status_label.setText("")
            return

        if self._validate_url(text):
            self.url_status_label.setText("✓ URL格式正确")
            self.url_status_label.setStyleSheet("color: #4CAF50; font-size: 12px;")
        else:
            self.url_status_label.setText("✗ URL格式不正确")
            self.url_status_label.setStyleSheet("color: #F44336; font-size: 12px;")

    def _validate_url(self, url: str) -> bool:
        """
        验证URL格式

        Args:
            url: URL字符串

        Returns:
            bool: 是否有效
        """
        # 简单的URL正则验证
        pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
            r'localhost|'  # localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)

        return pattern.match(url) is not None

    def validate(self) -> bool:
        """
        验证输入数据

        Returns:
            bool: 验证是否通过
        """
        # 验证账号选择
        if self.account_combo.currentIndex() < 0 or not self.accounts:
            QMessageBox.warning(self, "验证失败", "请选择账号！")
            self.account_combo.setFocus()
            return False

        # 验证标题
        title = self.title_input.text().strip()
        if not title:
            QMessageBox.warning(self, "验证失败", "文章标题不能为空！")
            self.title_input.setFocus()
            return False

        if len(title) > 200:
            QMessageBox.warning(self, "验证失败", "文章标题不能超过200个字符！")
            self.title_input.setFocus()
            return False

        # 验证URL
        url = self.url_input.text().strip()
        if not url:
            QMessageBox.warning(self, "验证失败", "文章链接不能为空！")
            self.url_input.setFocus()
            return False

        if not self._validate_url(url):
            QMessageBox.warning(self, "验证失败", "文章链接格式不正确！\n\n链接必须以 http:// 或 https:// 开头")
            self.url_input.setFocus()
            return False

        # 验证标签
        tags = self.tags_input.text().strip()
        if tags and len(tags) > 200:
            QMessageBox.warning(self, "验证失败", "标签总长度不能超过200个字符！")
            self.tags_input.setFocus()
            return False

        # 验证摘要
        summary = self.summary_input.toPlainText().strip()
        if len(summary) > 1000:
            QMessageBox.warning(self, "验证失败", "文章摘要不能超过1000个字符！")
            self.summary_input.setFocus()
            return False

        # 验证封面图链接
        cover_url = self.cover_input.text().strip()
        if cover_url and not self._validate_url(cover_url):
            reply = QMessageBox.question(
                self,
                "URL格式警告",
                "封面图链接格式可能不正确，是否继续？",
                QMessageBox.Yes | QMessageBox.No,
                QMessageBox.No
            )
            if reply == QMessageBox.No:
                self.cover_input.setFocus()
                return False

        return True

    def get_data(self) -> dict:
        """
        获取输入数据

        Returns:
            dict: 文章数据
        """
        # 获取选中的账号ID
        account_id = self.account_combo.currentData()

        # 获取选中账号的名称作为默认作者
        account_name = self.account_combo.currentText().split('(')[0].strip()
        author = self.author_input.text().strip() or account_name

        return {
            'account_id': account_id,
            'title': self.title_input.text().strip(),
            'url': self.url_input.text().strip(),
            'publish_date': self.date_edit.date().toString("yyyy-MM-dd"),
            'author': author,
            'tags': self.tags_input.text().strip(),
            'summary': self.summary_input.toPlainText().strip(),
            'cover_image': self.cover_input.text().strip()
        }

    def on_ok_clicked(self):
        """确定按钮被点击"""
        if self.validate():
            # 检查是否勾选"继续添加"
            if not self.is_edit_mode and hasattr(self, 'continue_checkbox'):
                self.continue_adding = self.continue_checkbox.isChecked()

            self.accept()

    def reset_form(self):
        """重置表单(用于继续添加)"""
        # 保持账号选择不变
        self.title_input.clear()
        self.url_input.clear()
        self.date_edit.setDate(QDate.currentDate())
        self.author_input.clear()
        self.tags_input.clear()
        self.summary_input.clear()
        self.cover_input.clear()
        self.url_status_label.setText("")

        # 焦点回到标题
        self.title_input.setFocus()

    @staticmethod
    def get_article_data(parent=None, article_data=None, accounts=None):
        """
        静态方法:显示对话框并返回数据

        Args:
            parent: 父窗口
            article_data: 文章数据(编辑模式)
            accounts: 账号列表

        Returns:
            tuple: (是否确认, 文章数据, 是否继续添加)
        """
        dialog = AddArticleDialog(parent, article_data, accounts)
        result = dialog.exec_()

        if result == QDialog.Accepted:
            return True, dialog.get_data(), dialog.continue_adding
        else:
            return False, None, False
