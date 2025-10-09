"""
素材库分类列表组件
负责展示素材库的分类筛选功能
"""
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout,
    QListWidget, QListWidgetItem, QLineEdit,
    QPushButton, QMessageBox
)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont
from datetime import datetime, timedelta


class MaterialCategoryWidget(QWidget):
    """素材库分类列表组件"""

    # 定义信号
    category_selected = pyqtSignal(str, str)  # (分类类型, 分类值)

    # 系统分类（不可编辑/删除）
    SYSTEM_CATEGORIES = [
        {"id": "all", "name": "📚 全部素材", "type": "all", "value": "", "system": True},
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
        """初始化UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)
        layout.setSpacing(8)

        # 标题栏
        title_layout = QHBoxLayout()
        title_label = QLineEdit()
        title_label.setText("📚 素材库分类")
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
        self.search_box.setPlaceholderText("🔍 搜索分类...")
        self.search_box.textChanged.connect(self.filter_categories)
        layout.addWidget(self.search_box)

        # 分类列表
        self.list_widget = QListWidget()
        self.list_widget.itemClicked.connect(self.on_item_clicked)

        # 设置列表样式 - 添加 hover 效果
        self.list_widget.setStyleSheet("""
            QListWidget::item {
                padding: 12px;
                border-radius: 4px;
                margin: 2px;
            }
            QListWidget::item:hover {
                background-color: #E3F2FD;
            }
            QListWidget::item:selected {
                background-color: #2196F3;
                color: white;
            }
            QListWidget::item:selected:hover {
                background-color: #1976D2;
            }
        """)

        layout.addWidget(self.list_widget)

        # 操作按钮
        btn_layout = QHBoxLayout()
        self.add_btn = QPushButton("➕ 新增")
        self.add_btn.setFixedHeight(32)
        self.edit_btn = QPushButton("📝 编辑")
        self.edit_btn.setFixedHeight(32)
        self.delete_btn = QPushButton("🗑️ 删除")
        self.delete_btn.setFixedHeight(32)

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
