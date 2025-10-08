"""
收藏到素材库对话框
用于将文章收藏到素材库并选择分类
"""
from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout,
    QLabel, QComboBox, QPushButton,
    QTextEdit, QMessageBox
)
from PyQt5.QtCore import Qt


class CollectDialog(QDialog):
    """收藏到素材库对话框"""

    # 预定义的分类
    CATEGORIES = [
        "科技",
        "营销",
        "运营",
        "其他"
    ]

    def __init__(self, parent=None, article_data=None):
        """
        初始化对话框

        Args:
            parent: 父窗口
            article_data: 文章数据字典
        """
        super().__init__(parent)
        self.article_data = article_data or {}
        self.init_ui()

    def init_ui(self):
        """初始化UI"""
        self.setWindowTitle("收藏到素材库")
        self.setMinimumWidth(400)
        self.setModal(True)

        layout = QVBoxLayout(self)
        layout.setSpacing(15)

        # 文章信息显示
        info_label = QLabel("📄 收藏文章信息：")
        info_label.setStyleSheet("font-weight: bold; font-size: 14px;")
        layout.addWidget(info_label)

        # 文章标题
        title_text = self.article_data.get('title', '未知标题')
        title_label = QLabel(f"标题：{title_text}")
        title_label.setWordWrap(True)
        layout.addWidget(title_label)

        # 原账号
        author = self.article_data.get('author', '未知')
        author_label = QLabel(f"作者：{author}")
        layout.addWidget(author_label)

        # 分隔线
        line = QLabel("─" * 50)
        line.setStyleSheet("color: #E0E0E0;")
        layout.addWidget(line)

        # 选择分类
        category_label = QLabel("🏷️ 选择分类：")
        category_label.setStyleSheet("font-weight: bold; font-size: 13px;")
        layout.addWidget(category_label)

        self.category_combo = QComboBox()
        self.category_combo.addItems(self.CATEGORIES)
        self.category_combo.setFixedHeight(32)
        layout.addWidget(self.category_combo)

        # 如果文章已有标签，尝试自动匹配分类
        existing_tags = self.article_data.get('tags', '')
        for i, category in enumerate(self.CATEGORIES):
            if category in existing_tags:
                self.category_combo.setCurrentIndex(i)
                break

        # 添加备注（可选）
        note_label = QLabel("💡 添加备注（可选）：")
        note_label.setStyleSheet("font-weight: bold; font-size: 13px;")
        layout.addWidget(note_label)

        self.note_edit = QTextEdit()
        self.note_edit.setPlaceholderText("可以添加一些备注信息，如收藏原因、用途等...")
        self.note_edit.setMaximumHeight(80)
        layout.addWidget(self.note_edit)

        # 提示信息
        tip_label = QLabel("💡 收藏后，文章将添加到素材库中，不影响原账号的文章")
        tip_label.setStyleSheet("color: #666666; font-size: 12px;")
        tip_label.setWordWrap(True)
        layout.addWidget(tip_label)

        # 按钮
        button_layout = QHBoxLayout()
        button_layout.addStretch()

        cancel_btn = QPushButton("取消")
        cancel_btn.setFixedSize(80, 32)
        cancel_btn.clicked.connect(self.reject)

        collect_btn = QPushButton("✨ 收藏")
        collect_btn.setFixedSize(80, 32)
        collect_btn.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #45A049;
            }
            QPushButton:pressed {
                background-color: #3D8B40;
            }
        """)
        collect_btn.clicked.connect(self.accept)

        button_layout.addWidget(cancel_btn)
        button_layout.addWidget(collect_btn)
        layout.addLayout(button_layout)

    def get_data(self):
        """
        获取对话框数据

        Returns:
            dict: 包含分类和备注的字典
        """
        category = self.category_combo.currentText()
        note = self.note_edit.toPlainText().strip()

        return {
            'category': category,
            'note': note
        }
