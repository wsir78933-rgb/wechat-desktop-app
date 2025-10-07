"""
UI样式定义
浅色主题的QSS样式
"""

# 主窗口样式
MAIN_WINDOW_STYLE = """
QMainWindow {
    background-color: #FFFFFF;
}

QWidget {
    font-family: "Microsoft YaHei UI", "Segoe UI", sans-serif;
    font-size: 14px;
}

QStatusBar {
    background-color: #F5F5F5;
    border-top: 1px solid #E0E0E0;
    color: #666666;
}
"""

# 列表组件样式
LIST_WIDGET_STYLE = """
QListWidget {
    background-color: #FFFFFF;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    padding: 5px;
    outline: none;
}

QListWidget::item {
    padding: 10px;
    border-radius: 4px;
    margin: 2px 0;
    border: none;
}

QListWidget::item:selected {
    background-color: #E3F2FD;
    color: #1976D2;
}

QListWidget::item:hover {
    background-color: #F5F5F5;
}

QListWidget::item:selected:hover {
    background-color: #BBDEFB;
}
"""

# 按钮样式
BUTTON_STYLE = """
QPushButton {
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
}

QPushButton:hover {
    background-color: #1976D2;
}

QPushButton:pressed {
    background-color: #0D47A1;
}

QPushButton:disabled {
    background-color: #BDBDBD;
    color: #FFFFFF;
}
"""

# 次要按钮样式
SECONDARY_BUTTON_STYLE = """
QPushButton {
    background-color: #FFFFFF;
    color: #2196F3;
    border: 1px solid #2196F3;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
}

QPushButton:hover {
    background-color: #E3F2FD;
}

QPushButton:pressed {
    background-color: #BBDEFB;
}
"""

# 危险按钮样式
DANGER_BUTTON_STYLE = """
QPushButton {
    background-color: #F44336;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
}

QPushButton:hover {
    background-color: #D32F2F;
}

QPushButton:pressed {
    background-color: #B71C1C;
}
"""

# 输入框样式
LINE_EDIT_STYLE = """
QLineEdit {
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    padding: 8px;
    font-size: 14px;
    background-color: #FFFFFF;
}

QLineEdit:focus {
    border: 1px solid #2196F3;
}

QLineEdit:disabled {
    background-color: #F5F5F5;
    color: #999999;
}
"""

# 文本框样式
TEXT_EDIT_STYLE = """
QTextEdit {
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    padding: 8px;
    font-size: 14px;
    background-color: #FFFFFF;
}

QTextEdit:focus {
    border: 1px solid #2196F3;
}
"""

# 下拉框样式
COMBO_BOX_STYLE = """
QComboBox {
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 14px;
    background-color: #FFFFFF;
}

QComboBox:hover {
    border: 1px solid #2196F3;
}

QComboBox:focus {
    border: 1px solid #2196F3;
}

QComboBox::drop-down {
    border: none;
    width: 30px;
}

QComboBox::down-arrow {
    image: none;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #666666;
    margin-right: 10px;
}

QComboBox QAbstractItemView {
    border: 1px solid #E0E0E0;
    background-color: #FFFFFF;
    selection-background-color: #E3F2FD;
    selection-color: #1976D2;
}
"""

# 标签样式
LABEL_STYLE = """
QLabel {
    color: #333333;
    font-size: 14px;
}
"""

# 对话框样式
DIALOG_STYLE = """
QDialog {
    background-color: #FFFFFF;
}

QLabel {
    color: #333333;
}
"""

# 分隔器样式
SPLITTER_STYLE = """
QSplitter::handle {
    background-color: #E0E0E0;
    width: 1px;
}

QSplitter::handle:hover {
    background-color: #2196F3;
}
"""

# 菜单栏样式
MENU_BAR_STYLE = """
QMenuBar {
    background-color: #FFFFFF;
    border-bottom: 1px solid #E0E0E0;
    padding: 4px;
}

QMenuBar::item {
    padding: 6px 12px;
    background-color: transparent;
    border-radius: 4px;
}

QMenuBar::item:selected {
    background-color: #E3F2FD;
}

QMenuBar::item:pressed {
    background-color: #BBDEFB;
}
"""

# 菜单样式
MENU_STYLE = """
QMenu {
    background-color: #FFFFFF;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    padding: 5px;
}

QMenu::item {
    padding: 8px 30px 8px 30px;
    border-radius: 4px;
}

QMenu::item:selected {
    background-color: #E3F2FD;
}

QMenu::separator {
    height: 1px;
    background-color: #E0E0E0;
    margin: 5px 10px;
}
"""

# 工具栏样式
TOOLBAR_STYLE = """
QToolBar {
    background-color: #F5F5F5;
    border-bottom: 1px solid #E0E0E0;
    spacing: 5px;
    padding: 5px;
}

QToolBar::separator {
    background-color: #E0E0E0;
    width: 1px;
    margin: 5px;
}

QToolButton {
    background-color: transparent;
    border: none;
    border-radius: 4px;
    padding: 6px;
}

QToolButton:hover {
    background-color: #E0E0E0;
}

QToolButton:pressed {
    background-color: #BDBDBD;
}
"""

# 滚动条样式
SCROLLBAR_STYLE = """
QScrollBar:vertical {
    border: none;
    background-color: #F5F5F5;
    width: 12px;
    border-radius: 6px;
}

QScrollBar::handle:vertical {
    background-color: #BDBDBD;
    border-radius: 6px;
    min-height: 30px;
}

QScrollBar::handle:vertical:hover {
    background-color: #9E9E9E;
}

QScrollBar::add-line:vertical,
QScrollBar::sub-line:vertical {
    height: 0px;
}

QScrollBar:horizontal {
    border: none;
    background-color: #F5F5F5;
    height: 12px;
    border-radius: 6px;
}

QScrollBar::handle:horizontal {
    background-color: #BDBDBD;
    border-radius: 6px;
    min-width: 30px;
}

QScrollBar::handle:horizontal:hover {
    background-color: #9E9E9E;
}

QScrollBar::add-line:horizontal,
QScrollBar::sub-line:horizontal {
    width: 0px;
}
"""

# 组合完整样式
FULL_STYLE = f"""
{MAIN_WINDOW_STYLE}
{LIST_WIDGET_STYLE}
{BUTTON_STYLE}
{LINE_EDIT_STYLE}
{TEXT_EDIT_STYLE}
{COMBO_BOX_STYLE}
{LABEL_STYLE}
{SPLITTER_STYLE}
{MENU_BAR_STYLE}
{MENU_STYLE}
{TOOLBAR_STYLE}
{SCROLLBAR_STYLE}
"""


# 图标常量（使用Unicode Emoji）
ICONS = {
    'account': '👤',
    'article': '📄',
    'add': '➕',
    'refresh': '🔄',
    'export': '📤',
    'settings': '⚙️',
    'search': '🔍',
    'link': '🔗',
    'edit': '📝',
    'delete': '🗑️',
    'calendar': '📅',
    'category': '📁',
    'tag': '🏷️',
    'check': '✓',
    'warning': '⚠️',
    'error': '❌',
    'success': '✅',
}


def get_icon(name: str) -> str:
    """
    获取图标

    Args:
        name: 图标名称

    Returns:
        str: 图标字符
    """
    return ICONS.get(name, '')
