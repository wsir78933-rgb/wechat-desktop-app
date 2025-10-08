"""
素材库分类列表组件
负责展示素材库的分类筛选功能
"""
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout,
    QListWidget, QListWidgetItem, QLineEdit
)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont
from datetime import datetime, timedelta


class MaterialCategoryWidget(QWidget):
    """素材库分类列表组件"""

    # 定义信号
    category_selected = pyqtSignal(str, str)  # (分类类型, 分类值)

    # 预定义的分类
    CATEGORIES = [
        {"id": "all", "name": "📚 全部素材", "type": "all", "value": ""},
        {"id": "tech", "name": "💻 科技类", "type": "category", "value": "科技"},
        {"id": "marketing", "name": "📈 营销类", "type": "category", "value": "营销"},
        {"id": "operation", "name": "⚙️ 运营类", "type": "category", "value": "运营"},
        {"id": "this_week", "name": "📅 本周添加", "type": "time", "value": "week"},
        {"id": "this_month", "name": "📆 本月添加", "type": "time", "value": "month"},
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
        self.init_ui()
        self.load_material_library_id()

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

        # 提示信息
        info_label = QLineEdit()
        info_label.setText("💡 选择分类查看对应素材")
        info_label.setReadOnly(True)
        info_label.setStyleSheet("""
            QLineEdit {
                border: none;
                background-color: transparent;
                color: #666666;
                font-size: 12px;
            }
        """)
        layout.addWidget(info_label)

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

        for category in self.CATEGORIES:
            self._add_category_item(category)

        # 默认选中第一个（全部素材）
        if self.list_widget.count() > 0:
            self.list_widget.setCurrentRow(0)
            self.current_category_id = self.CATEGORIES[0]['id']

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

        self.current_category_id = category_id

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
            for category in self.CATEGORIES:
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
