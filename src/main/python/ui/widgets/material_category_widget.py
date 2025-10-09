"""
素材库分类列表组件
负责展示素材库的分类筛选功能
"""
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout,
    QListWidget, QListWidgetItem, QLineEdit,
    QPushButton, QMessageBox, QLabel
)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont, QCursor
from datetime import datetime, timedelta


class MaterialCategoryWidget(QWidget):
    """素材库分类列表组件"""

    # 定义信号
    category_selected = pyqtSignal(str, str)  # (分类类型, 分类值)

    # 系统分类（不可编辑/删除）- 显示在列表中的
    SYSTEM_CATEGORIES = [
        {"id": "all", "name": "📚 全部素材", "type": "all", "value": "", "system": True},
    ]

    # 时间过滤器（显示在底部的小字）
    TIME_FILTERS = [
        {"id": "this_week", "name": "📅 本周添加", "type": "time", "value": "week", "system": True},
        {"id": "this_month", "name": "📆 本月添加", "type": "time", "value": "month", "system": True},
    ]

    # 默认自定义分类（可编辑/删除）
    DEFAULT_CUSTOM_CATEGORIES = [
        {"id": "tech", "name": "💻 科技类", "type": "category", "value": "科技", "system": False},
        {"id": "marketing", "name": "📈 营销类", "type": "category", "value": "营销", "system": False},
        {"id": "operation", "name": "⚙️ 运营类", "type": "category", "value": "运营", "system": False},
    ]

    def __init__(self, account_manager=None, article_manager=None):
        """
        初始化素材库分类组件

        Args:
            account_manager: 账号管理器实例
            article_manager: 文章管理器实例
        """
        super().__init__()
        self.account_manager = account_manager
        self.article_manager = article_manager
        self.current_category_id = None
        self.material_library_id = None  # 素材库账号ID
        self.custom_categories = []  # 自定义分类列表
        self.all_categories = []  # 所有分类（系统+自定义）
        self.init_ui()
        self.load_material_library_id()
        self.load_categories_from_storage()

    def init_ui(self):
        """初始化UI - Fluent Design 风格"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(12)

        # 设置整体背景
        self.setStyleSheet("""
            MaterialCategoryWidget {
                background-color: #FAFAFA;
                border-radius: 8px;
            }
        """)

        # 标题栏
        title_layout = QHBoxLayout()
        title_label = QLineEdit()
        title_label.setText("📚 素材库分类")
        title_label.setReadOnly(True)
        title_label.setStyleSheet("""
            QLineEdit {
                border: none;
                background-color: transparent;
                font-size: 18px;
                font-weight: bold;
                color: #1A1A1A;
                padding: 4px 8px;
            }
        """)
        title_layout.addWidget(title_label)
        layout.addLayout(title_layout)

        # 搜索框 - Fluent Design 风格
        self.search_box = QLineEdit()
        self.search_box.setPlaceholderText("🔍 搜索分类...")
        self.search_box.setFixedHeight(40)
        self.search_box.setStyleSheet("""
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
            QLineEdit::placeholder {
                color: #999999;
            }
        """)
        self.search_box.textChanged.connect(self.filter_categories)
        layout.addWidget(self.search_box)

        # 分类列表 - Fluent Design 风格
        self.list_widget = QListWidget()
        self.list_widget.itemClicked.connect(self.on_item_clicked)

        # 设置列表样式 - Fluent Design 风格
        self.list_widget.setStyleSheet("""
            QListWidget {
                background-color: white;
                border: none;
                border-radius: 8px;
                padding: 4px;
            }
            QListWidget::item {
                padding: 16px 12px;
                border-radius: 6px;
                margin: 3px 2px;
                color: #333333;
                font-size: 13px;
            }
            QListWidget::item:hover {
                background-color: #F3F3F3;
            }
            QListWidget::item:selected {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #0078D4,
                    stop:1 #005A9E
                );
                color: white;
                border: none;
            }
            QListWidget::item:selected:hover {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #106EBE,
                    stop:1 #00477D
                );
            }
        """)

        layout.addWidget(self.list_widget)

        # 操作按钮 - Fluent Design 风格
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(8)

        # 新增按钮 - Fluent 风格渐变
        self.add_btn = QPushButton("➕ 新增")
        self.add_btn.setFixedHeight(38)
        self.add_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #4CAF50,
                    stop:1 #45A049
                );
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 13px;
                padding: 8px 16px;
            }
            QPushButton:hover {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #45A049,
                    stop:1 #3D8B40
                );
            }
            QPushButton:pressed {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #3D8B40,
                    stop:1 #2E7D32
                );
                padding-top: 9px;
                padding-bottom: 7px;
            }
        """)

        # 编辑按钮 - Fluent 风格渐变
        self.edit_btn = QPushButton("📝 编辑")
        self.edit_btn.setFixedHeight(38)
        self.edit_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #0078D4,
                    stop:1 #005A9E
                );
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 13px;
                padding: 8px 16px;
            }
            QPushButton:hover:enabled {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #106EBE,
                    stop:1 #00477D
                );
            }
            QPushButton:pressed:enabled {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #005A9E,
                    stop:1 #003D6B
                );
                padding-top: 9px;
                padding-bottom: 7px;
            }
            QPushButton:disabled {
                background-color: #D0D0D0;
                color: #888888;
            }
        """)

        # 删除按钮 - Fluent 风格渐变
        self.delete_btn = QPushButton("🗑️ 删除")
        self.delete_btn.setFixedHeight(38)
        self.delete_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #E81123,
                    stop:1 #C50F1F
                );
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 13px;
                padding: 8px 16px;
            }
            QPushButton:hover:enabled {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #D32F2F,
                    stop:1 #B71C1C
                );
            }
            QPushButton:pressed:enabled {
                background: qlineargradient(
                    x1:0, y1:0, x2:0, y2:1,
                    stop:0 #C50F1F,
                    stop:1 #A00F1F
                );
                padding-top: 9px;
                padding-bottom: 7px;
            }
            QPushButton:disabled {
                background-color: #D0D0D0;
                color: #888888;
            }
        """)

        self.add_btn.clicked.connect(self.on_add_clicked)
        self.edit_btn.clicked.connect(self.on_edit_clicked)
        self.delete_btn.clicked.connect(self.on_delete_clicked)

        # 初始状态禁用编辑和删除按钮
        self.edit_btn.setEnabled(False)
        self.delete_btn.setEnabled(False)

        btn_layout.addWidget(self.add_btn)
        btn_layout.addWidget(self.edit_btn)
        btn_layout.addWidget(self.delete_btn)
        layout.addLayout(btn_layout)

        # 时间过滤器 - Fluent Design 风格
        time_filter_layout = QHBoxLayout()
        time_filter_layout.setContentsMargins(8, 12, 8, 8)
        time_filter_layout.setSpacing(12)

        filter_label = QLabel("快速筛选：")
        filter_label.setStyleSheet("""
            QLabel {
                color: #666666;
                font-size: 12px;
                font-weight: 500;
            }
        """)
        time_filter_layout.addWidget(filter_label)

        # 本周添加 - Fluent 风格链接
        self.week_filter_label = QLabel("📅 本周添加")
        self.week_filter_label.setStyleSheet("""
            QLabel {
                color: #0078D4;
                font-size: 12px;
                padding: 6px 12px;
                border-radius: 6px;
                background-color: transparent;
            }
            QLabel:hover {
                background-color: #F3F3F3;
                color: #005A9E;
            }
        """)
        self.week_filter_label.setCursor(Qt.PointingHandCursor)
        self.week_filter_label.mousePressEvent = lambda e: self.on_time_filter_clicked("week")
        time_filter_layout.addWidget(self.week_filter_label)

        # 本月添加 - Fluent 风格链接
        self.month_filter_label = QLabel("📆 本月添加")
        self.month_filter_label.setStyleSheet("""
            QLabel {
                color: #0078D4;
                font-size: 12px;
                padding: 6px 12px;
                border-radius: 6px;
                background-color: transparent;
            }
            QLabel:hover {
                background-color: #F3F3F3;
                color: #005A9E;
            }
        """)
        self.month_filter_label.setCursor(Qt.PointingHandCursor)
        self.month_filter_label.mousePressEvent = lambda e: self.on_time_filter_clicked("month")
        time_filter_layout.addWidget(self.month_filter_label)

        time_filter_layout.addStretch()
        layout.addLayout(time_filter_layout)

        self.title_label = title_label

        # 加载分类列表
        self.load_categories()

    def load_material_library_id(self):
        """加载素材库账号ID"""
        if self.account_manager:
            try:
                self.material_library_id = self.account_manager.get_material_library_id()
            except Exception as e:
                print(f"获取素材库ID失败: {e}")
                self.material_library_id = None

    def load_categories(self):
        """加载分类列表"""
        self.list_widget.clear()

        # 合并系统分类和自定义分类
        self.all_categories = self.SYSTEM_CATEGORIES + self.custom_categories

        for category in self.all_categories:
            self._add_category_item(category)

        # 默认选中第一个（全部素材）
        if self.list_widget.count() > 0:
            self.list_widget.setCurrentRow(0)
            self.current_category_id = self.SYSTEM_CATEGORIES[0]['id']

    def _add_category_item(self, category: dict):
        """
        添加分类项到列表

        Args:
            category: 分类数据字典
        """
        item = QListWidgetItem()
        item.setData(Qt.UserRole, category['id'])
        item.setData(Qt.UserRole + 1, category['type'])
        item.setData(Qt.UserRole + 2, category['value'])
        item.setData(Qt.UserRole + 3, category.get('system', False))  # 是否系统分类

        # 格式化显示文本
        text = category['name']

        # 如果有文章管理器，显示文章数量
        if self.article_manager and self.material_library_id:
            try:
                count = self._get_category_article_count(category)
                text += f" ({count})"
            except Exception as e:
                print(f"获取分类文章数失败: {e}")

        item.setText(text)

        # 设置字体
        font = QFont()
        font.setPointSize(11)
        item.setFont(font)

        self.list_widget.addItem(item)

    def _get_category_article_count(self, category: dict) -> int:
        """
        获取分类下的文章数量

        Args:
            category: 分类数据

        Returns:
            int: 文章数量
        """
        if not self.article_manager or not self.material_library_id:
            return 0

        # 获取素材库的所有文章
        all_articles = self.article_manager.get_articles_by_account(self.material_library_id)

        # 根据分类类型筛选
        if category['type'] == 'all':
            return len(all_articles)

        elif category['type'] == 'category':
            # 按文章标签筛选（假设分类信息存储在tags中）
            category_value = category['value']
            return sum(1 for article in all_articles
                      if category_value in article.get('tags', ''))

        elif category['type'] == 'time':
            # 按时间筛选
            now = datetime.now()
            if category['value'] == 'week':
                # 本周
                week_start = now - timedelta(days=now.weekday())
                return sum(1 for article in all_articles
                          if article.get('created_at', '') >= week_start.strftime('%Y-%m-%d'))
            elif category['value'] == 'month':
                # 本月
                month_start = now.replace(day=1)
                return sum(1 for article in all_articles
                          if article.get('created_at', '') >= month_start.strftime('%Y-%m-%d'))

        return 0

    def on_item_clicked(self, item: QListWidgetItem):
        """
        分类项被点击

        Args:
            item: 被点击的项
        """
        category_id = item.data(Qt.UserRole)
        category_type = item.data(Qt.UserRole + 1)
        category_value = item.data(Qt.UserRole + 2)
        is_system = item.data(Qt.UserRole + 3)

        self.current_category_id = category_id

        # 更新按钮状态
        if is_system:
            # 系统分类不可编辑/删除
            self.edit_btn.setEnabled(False)
            self.delete_btn.setEnabled(False)
        else:
            # 自定义分类可编辑/删除
            self.edit_btn.setEnabled(True)
            self.delete_btn.setEnabled(True)

        # 发送信号，传递分类类型和值
        self.category_selected.emit(category_type, category_value)

    def on_time_filter_clicked(self, time_value):
        """
        时间过滤器被点击

        Args:
            time_value: 时间过滤值 ("week" 或 "month")
        """
        # 清除列表选中状态
        self.list_widget.clearSelection()
        self.current_category_id = None

        # 禁用编辑和删除按钮
        self.edit_btn.setEnabled(False)
        self.delete_btn.setEnabled(False)

        # 发送信号，传递时间过滤类型和值
        self.category_selected.emit("time", time_value)

    def refresh(self):
        """刷新分类列表（重新计算文章数）"""
        self.load_categories()

    def get_selected_category(self):
        """
        获取当前选中的分类

        Returns:
            dict: 分类信息，如果未选中则返回None
        """
        if self.current_category_id:
            for category in self.all_categories:
                if category['id'] == self.current_category_id:
                    return category
        return None

    def get_material_library_id(self):
        """
        获取素材库账号ID

        Returns:
            int: 素材库账号ID
        """
        return self.material_library_id

    def load_categories_from_storage(self):
        """从JSON配置文件加载自定义分类"""
        import os
        import json

        # 配置文件路径
        config_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
            'data'
        )
        config_file = os.path.join(config_dir, 'material_categories.json')

        # 如果配置文件不存在，使用默认分类
        if not os.path.exists(config_file):
            self.custom_categories = self.DEFAULT_CUSTOM_CATEGORIES.copy()
            # 保存默认配置
            self.save_categories_to_storage()
            return

        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.custom_categories = data.get('custom_categories', self.DEFAULT_CUSTOM_CATEGORIES.copy())
        except Exception as e:
            print(f"加载分类配置失败: {e}")
            self.custom_categories = self.DEFAULT_CUSTOM_CATEGORIES.copy()

    def save_categories_to_storage(self):
        """保存自定义分类到JSON配置文件"""
        import os
        import json

        # 配置文件路径
        config_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
            'data'
        )
        os.makedirs(config_dir, exist_ok=True)
        config_file = os.path.join(config_dir, 'material_categories.json')

        try:
            data = {
                'system_categories': self.SYSTEM_CATEGORIES,
                'custom_categories': self.custom_categories
            }
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存分类配置失败: {e}")

    def filter_categories(self, text: str):
        """
        过滤分类列表

        Args:
            text: 搜索文本
        """
        search_text = text.lower().strip()

        for i in range(self.list_widget.count()):
            item = self.list_widget.item(i)
            item_text = item.text().lower()

            if search_text:
                item.setHidden(search_text not in item_text)
            else:
                item.setHidden(False)

    def on_add_clicked(self):
        """新增分类按钮点击"""
        try:
            from ui.dialogs.category_dialog import CategoryDialog
            dialog = CategoryDialog(self, mode="add")

            if dialog.exec_():
                # 获取分类数据
                data = dialog.get_data()

                # 生成唯一ID
                import uuid
                category_id = f"custom_{uuid.uuid4().hex[:8]}"

                # 创建新分类
                new_category = {
                    'id': category_id,
                    'name': data['display_name'],
                    'icon': data['icon'],
                    'type': 'category',
                    'value': data['name'],
                    'system': False
                }

                # 添加到自定义分类列表
                self.custom_categories.append(new_category)

                # 保存到配置文件
                self.save_categories_to_storage()

                # 刷新列表
                self.load_categories()

                QMessageBox.information(self, "成功", f"分类 {data['display_name']} 已创建！")

        except ImportError as e:
            QMessageBox.warning(self, "错误", f"无法加载分类对话框：{str(e)}")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"新增分类时出错：{str(e)}")

    def on_edit_clicked(self):
        """编辑分类按钮点击"""
        if not self.current_category_id:
            return

        # 查找当前选中的分类
        current_category = None
        for category in self.custom_categories:
            if category['id'] == self.current_category_id:
                current_category = category
                break

        if not current_category:
            QMessageBox.warning(self, "错误", "未找到选中的分类！")
            return

        try:
            from ui.dialogs.category_dialog import CategoryDialog

            # 准备对话框数据
            dialog_data = {
                'name': current_category['value'],
                'icon': current_category.get('icon', current_category['name'][0])
            }

            dialog = CategoryDialog(self, category_data=dialog_data, mode="edit")

            if dialog.exec_():
                # 获取修改后的数据
                data = dialog.get_data()

                # 更新分类
                current_category['name'] = data['display_name']
                current_category['icon'] = data['icon']
                current_category['value'] = data['name']

                # 保存到配置文件
                self.save_categories_to_storage()

                # 刷新列表
                self.load_categories()

                QMessageBox.information(self, "成功", f"分类 {data['display_name']} 已更新！")

        except ImportError as e:
            QMessageBox.warning(self, "错误", f"无法加载分类对话框：{str(e)}")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"编辑分类时出错：{str(e)}")

    def on_delete_clicked(self):
        """删除分类按钮点击"""
        if not self.current_category_id:
            return

        # 查找当前选中的分类
        current_category = None
        for category in self.custom_categories:
            if category['id'] == self.current_category_id:
                current_category = category
                break

        if not current_category:
            QMessageBox.warning(self, "错误", "未找到选中的分类！")
            return

        # 确认删除
        reply = QMessageBox.question(
            self,
            '确认删除',
            f"确定要删除分类 {current_category['name']} 吗？\n\n"
            f"该分类下的文章不会被删除，但标签会被保留。",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )

        if reply == QMessageBox.Yes:
            try:
                # 从列表中移除
                self.custom_categories.remove(current_category)

                # 保存到配置文件
                self.save_categories_to_storage()

                # 刷新列表
                self.load_categories()

                # 清除选中状态
                self.current_category_id = None
                self.edit_btn.setEnabled(False)
                self.delete_btn.setEnabled(False)

                QMessageBox.information(self, "成功", f"分类 {current_category['name']} 已删除！")

            except Exception as e:
                QMessageBox.critical(self, "错误", f"删除分类时出错：{str(e)}")
