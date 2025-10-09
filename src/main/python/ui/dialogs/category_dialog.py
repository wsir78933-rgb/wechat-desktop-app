"""
分类管理对话框
用于新增和编辑素材库分类
"""
from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QGridLayout,
    QLabel, QLineEdit, QPushButton, QMessageBox,
    QButtonGroup, QRadioButton
)
from PyQt5.QtCore import Qt


class CategoryDialog(QDialog):
    """分类管理对话框"""

    # 预设图标列表
    ICONS = [
        "🎨", "📐", "🖌️", "✂️", "📷", "🎬",
        "💼", "🏷️", "⭐", "📌", "💡", "🔖"
    ]

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
        self.selected_icon = self.category_data.get('icon', self.ICONS[0])
        self.init_ui()

    def init_ui(self):
        """初始化UI"""
        if self.mode == "add":
            self.setWindowTitle("➕ 新增素材分类")
        else:
            self.setWindowTitle("📝 编辑素材分类")

        self.setMinimumWidth(450)
        self.setMinimumHeight(400)
        self.setModal(True)

        layout = QVBoxLayout(self)
        layout.setSpacing(15)

        # 分类名称输入
        name_label = QLabel("分类名称：")
        name_label.setStyleSheet("font-weight: bold; font-size: 13px;")
        layout.addWidget(name_label)

        self.name_edit = QLineEdit()
        self.name_edit.setPlaceholderText("请输入分类名称，如：设计类")
        self.name_edit.setFixedHeight(32)
        if self.mode == "edit":
            self.name_edit.setText(self.category_data.get('name', ''))
        layout.addWidget(self.name_edit)

        # 图标选择
        icon_label = QLabel("选择图标：")
        icon_label.setStyleSheet("font-weight: bold; font-size: 13px;")
        layout.addWidget(icon_label)

        # 图标网格
        icon_grid = QGridLayout()
        icon_grid.setSpacing(10)

        self.icon_group = QButtonGroup(self)
        self.icon_buttons = []

        for i, icon in enumerate(self.ICONS):
            row = i // 6
            col = i % 6

            icon_btn = QRadioButton(icon)
            icon_btn.setStyleSheet("""
                QRadioButton {
                    font-size: 24px;
                    padding: 8px;
                }
                QRadioButton:hover {
                    background-color: #E3F2FD;
                    border-radius: 4px;
                }
                QRadioButton:checked {
                    background-color: #2196F3;
                    color: white;
                    border-radius: 4px;
                }
            """)
            icon_btn.toggled.connect(lambda checked, ic=icon: self.on_icon_selected(checked, ic))

            # 默认选中
            if icon == self.selected_icon:
                icon_btn.setChecked(True)

            self.icon_group.addButton(icon_btn, i)
            self.icon_buttons.append(icon_btn)
            icon_grid.addWidget(icon_btn, row, col)

        layout.addLayout(icon_grid)

        # 预览区域
        preview_label = QLabel("预览效果：")
        preview_label.setStyleSheet("font-weight: bold; font-size: 13px;")
        layout.addWidget(preview_label)

        self.preview_label = QLabel()
        self.preview_label.setStyleSheet("""
            QLabel {
                font-size: 20px;
                padding: 15px;
                background-color: #F5F5F5;
                border: 2px solid #E0E0E0;
                border-radius: 8px;
            }
        """)
        self.update_preview()
        layout.addWidget(self.preview_label)

        # 提示信息
        if self.mode == "edit":
            tip_label = QLabel("💡 修改后，该分类下的文章标签也会更新")
        else:
            tip_label = QLabel("💡 创建后，可以在收藏文章时选择此分类")
        tip_label.setStyleSheet("color: #666666; font-size: 12px;")
        tip_label.setWordWrap(True)
        layout.addWidget(tip_label)

        # 实时更新预览
        self.name_edit.textChanged.connect(self.update_preview)

        # 按钮
        button_layout = QHBoxLayout()
        button_layout.addStretch()

        cancel_btn = QPushButton("取消")
        cancel_btn.setFixedSize(80, 32)
        cancel_btn.clicked.connect(self.reject)

        if self.mode == "add":
            confirm_btn = QPushButton("✨ 创建")
        else:
            confirm_btn = QPushButton("💾 保存")

        confirm_btn.setFixedSize(80, 32)
        confirm_btn.setStyleSheet("""
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
        confirm_btn.clicked.connect(self.on_confirm)

        button_layout.addWidget(cancel_btn)
        button_layout.addWidget(confirm_btn)
        layout.addLayout(button_layout)

    def on_icon_selected(self, checked, icon):
        """
        图标被选中

        Args:
            checked: 是否选中
            icon: 图标字符
        """
        if checked:
            self.selected_icon = icon
            self.update_preview()

    def update_preview(self):
        """更新预览"""
        name = self.name_edit.text().strip() or "分类名称"
        self.preview_label.setText(f"{self.selected_icon} {name}")

    def on_confirm(self):
        """确认按钮点击"""
        name = self.name_edit.text().strip()

        if not name:
            QMessageBox.warning(self, "提示", "请输入分类名称！")
            self.name_edit.setFocus()
            return

        if len(name) > 10:
            QMessageBox.warning(self, "提示", "分类名称不能超过10个字符！")
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
            'icon': self.selected_icon,
            'display_name': f"{self.selected_icon} {name}"  # 用于显示的完整名称
        }
