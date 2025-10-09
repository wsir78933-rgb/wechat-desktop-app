"""
分类管理对话框
用于新增和编辑素材库分类
"""
from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QPushButton, QMessageBox
)
from PyQt5.QtCore import Qt


class CategoryDialog(QDialog):
    """分类管理对话框"""

    def __init__(self, parent=None, category_data=None, mode="add"):
        """
        初始化对话框

        Args:
            parent: 父窗口
            category_data: 分类数据字典（编辑模式使用）
            mode: 对话框模式 ("add" 或 "edit")
        """
        super().__init__(parent)
        self.category_data = category_data or {}
        self.mode = mode
        self.init_ui()

    def init_ui(self):
        """初始化UI - Fluent Design 风格"""
        if self.mode == "add":
            self.setWindowTitle("➕ 新增素材分类")
        else:
            self.setWindowTitle("📝 编辑素材分类")

        self.setMinimumWidth(450)
        self.setMinimumHeight(220)
        self.setModal(True)

        # Fluent Design 风格背景
        self.setStyleSheet("""
            QDialog {
                background-color: #FAFAFA;
            }
        """)

        layout = QVBoxLayout(self)
        layout.setSpacing(18)
        layout.setContentsMargins(24, 24, 24, 24)

        # 分类名称输入
        name_label = QLabel("分类名称：")
        name_label.setStyleSheet("font-weight: bold; font-size: 13px;")
        layout.addWidget(name_label)

        self.name_edit = QLineEdit()
        self.name_edit.setPlaceholderText("请输入分类名称，如：设计类、营销类")
        self.name_edit.setFixedHeight(40)
        self.name_edit.setStyleSheet("""
            QLineEdit {
                background-color: white;
                border: 2px solid #E0E0E0;
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 13px;
                color: #333333;
            }
            QLineEdit:hover {
                border-color: #B0B0B0;
            }
            QLineEdit:focus {
                border-color: #0078D4;
                background-color: #FFFFFF;
            }
        """)
        if self.mode == "edit":
            self.name_edit.setText(self.category_data.get('name', ''))
        layout.addWidget(self.name_edit)

        # 提示信息
        if self.mode == "edit":
            tip_label = QLabel("💡 修改后，该分类下的文章标签也会更新")
        else:
            tip_label = QLabel("💡 创建后，可以在收藏文章时选择此分类")
        tip_label.setStyleSheet("color: #666666; font-size: 12px;")
        tip_label.setWordWrap(True)
        layout.addWidget(tip_label)

        layout.addStretch()

        # 按钮
        button_layout = QHBoxLayout()
        button_layout.addStretch()

        cancel_btn = QPushButton("取消")
        cancel_btn.setFixedSize(90, 38)
        cancel_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #F5F5F5,
                    stop:1 #E0E0E0
                );
                border: 1px solid #CCCCCC;
                border-radius: 8px;
                color: #333333;
                font-size: 13px;
                font-weight: bold;
            }
            QPushButton:hover {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #E0E0E0,
                    stop:1 #D0D0D0
                );
                border-color: #999999;
            }
            QPushButton:pressed {
                padding-top: 3px;
                padding-bottom: 1px;
            }
        """)
        cancel_btn.clicked.connect(self.reject)

        if self.mode == "add":
            confirm_btn = QPushButton("✨ 创建")
        else:
            confirm_btn = QPushButton("💾 保存")

        confirm_btn.setFixedSize(90, 38)
        confirm_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #4CAF50,
                    stop:1 #45A049
                );
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 13px;
                font-weight: bold;
            }
            QPushButton:hover {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #45A049,
                    stop:1 #3D8B40
                );
            }
            QPushButton:pressed {
                padding-top: 3px;
                padding-bottom: 1px;
            }
        """)
        confirm_btn.clicked.connect(self.on_confirm)

        button_layout.addWidget(cancel_btn)
        button_layout.addWidget(confirm_btn)
        layout.addLayout(button_layout)

    def on_confirm(self):
        """确认按钮点击"""
        name = self.name_edit.text().strip()

        if not name:
            QMessageBox.warning(self, "提示", "请输入分类名称！")
            self.name_edit.setFocus()
            return

        if len(name) > 20:
            QMessageBox.warning(self, "提示", "分类名称不能超过20个字符！")
            self.name_edit.setFocus()
            return

        self.accept()

    def get_data(self):
        """
        获取对话框数据

        Returns:
            dict: 包含分类信息的字典
        """
        name = self.name_edit.text().strip()

        return {
            'name': name,
            'icon': '📁',  # 使用统一的默认图标
            'display_name': f"📁 {name}"  # 用于显示的完整名称
        }
