"""
UI样式定义
Fluent Design 风格主题
基于 Microsoft Fluent Design 设计系统
"""

# 主窗口样式 - Fluent Design
MAIN_WINDOW_STYLE = """
QMainWindow {
    background-color: #FAFAFA;
}

QWidget {
    font-family: "Microsoft YaHei UI", "Segoe UI", sans-serif;
    font-size: 13px;
}

QStatusBar {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #F5F5F5,
        stop:1 #EEEEEE
    );
    border-top: 1px solid #E0E0E0;
    color: #666666;
}
"""

# 列表组件样式 - Fluent Design
LIST_WIDGET_STYLE = """
QListWidget {
    background-color: white;
    border: none;
    border-radius: 8px;
    padding: 4px;
    outline: none;
}

QListWidget::item {
    padding: 16px 12px;
    border-radius: 6px;
    margin: 3px 2px;
    border: none;
    color: #333333;
}

QListWidget::item:selected {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #0078D4,
        stop:1 #005A9E
    );
    color: white;
}

QListWidget::item:hover {
    background-color: #F3F3F3;
}

QListWidget::item:selected:hover {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #106EBE,
        stop:1 #005A9E
    );
}
"""

# 主按钮样式 - Fluent Design 蓝色渐变
BUTTON_STYLE = """
QPushButton {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #0078D4,
        stop:1 #005A9E
    );
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: bold;
    min-height: 38px;
}

QPushButton:hover {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #106EBE,
        stop:1 #005A9E
    );
}

QPushButton:pressed {
    padding-top: 11px;
    padding-bottom: 9px;
}

QPushButton:disabled {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #CCCCCC,
        stop:1 #BBBBBB
    );
    color: #888888;
}
"""

# 次要按钮样式 - Fluent Design 灰色渐变
SECONDARY_BUTTON_STYLE = """
QPushButton {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #F5F5F5,
        stop:1 #E0E0E0
    );
    color: #333333;
    border: 1px solid #CCCCCC;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: bold;
    min-height: 38px;
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
    padding-top: 11px;
    padding-bottom: 9px;
}
"""

# 危险按钮样式 - Fluent Design 红色渐变
DANGER_BUTTON_STYLE = """
QPushButton {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #E81123,
        stop:1 #C50F1F
    );
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: bold;
    min-height: 38px;
}

QPushButton:hover {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #D13438,
        stop:1 #A80000
    );
}

QPushButton:pressed {
    padding-top: 11px;
    padding-bottom: 9px;
}
"""

# 成功按钮样式 - Fluent Design 绿色渐变
SUCCESS_BUTTON_STYLE = """
QPushButton {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #4CAF50,
        stop:1 #45A049
    );
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: bold;
    min-height: 38px;
}

QPushButton:hover {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #45A049,
        stop:1 #3D8B40
    );
}

QPushButton:pressed {
    padding-top: 11px;
    padding-bottom: 9px;
}
"""

# 输入框样式 - Fluent Design
LINE_EDIT_STYLE = """
QLineEdit {
    background-color: white;
    border: 2px solid #E0E0E0;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 13px;
    color: #333333;
    min-height: 40px;
}

QLineEdit:hover {
    border-color: #B0B0B0;
}

QLineEdit:focus {
    border-color: #0078D4;
    background-color: #FFFFFF;
}

QLineEdit:disabled {
    background-color: #F5F5F5;
    color: #999999;
    border-color: #E0E0E0;
}
"""

# 文本框样式 - Fluent Design
TEXT_EDIT_STYLE = """
QTextEdit {
    background-color: white;
    border: 2px solid #E0E0E0;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 13px;
    color: #333333;
}

QTextEdit:hover {
    border-color: #B0B0B0;
}

QTextEdit:focus {
    border-color: #0078D4;
    background-color: #FFFFFF;
}

QTextEdit:disabled {
    background-color: #F5F5F5;
    color: #999999;
    border-color: #E0E0E0;
}
"""

# 下拉框样式 - Fluent Design
COMBO_BOX_STYLE = """
QComboBox {
    background-color: white;
    border: 2px solid #E0E0E0;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 13px;
    color: #333333;
    min-height: 40px;
}

QComboBox:hover {
    border-color: #B0B0B0;
}

QComboBox:focus {
    border-color: #0078D4;
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
    border: 2px solid #0078D4;
    border-radius: 8px;
    background-color: white;
    selection-background-color: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #0078D4,
        stop:1 #005A9E
    );
    selection-color: white;
    padding: 4px;
}

QComboBox QAbstractItemView::item {
    padding: 8px 12px;
    border-radius: 4px;
    min-height: 32px;
}

QComboBox QAbstractItemView::item:hover {
    background-color: #F3F3F3;
}
"""

# 标签样式
LABEL_STYLE = """
QLabel {
    color: #333333;
    font-size: 14px;
}
"""

# 对话框样式 - Fluent Design
DIALOG_STYLE = """
QDialog {
    background-color: #FAFAFA;
}

QLabel {
    color: #333333;
    font-size: 13px;
}
"""

# 分隔器样式 - Fluent Design
SPLITTER_STYLE = """
QSplitter::handle {
    background-color: #E0E0E0;
    width: 1px;
}

QSplitter::handle:hover {
    background-color: #0078D4;
}
"""

# 菜单栏样式 - Fluent Design
MENU_BAR_STYLE = """
QMenuBar {
    background-color: #FAFAFA;
    border-bottom: 1px solid #E0E0E0;
    padding: 6px;
}

QMenuBar::item {
    padding: 8px 14px;
    background-color: transparent;
    border-radius: 6px;
    color: #333333;
}

QMenuBar::item:selected {
    background-color: #F3F3F3;
}

QMenuBar::item:pressed {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #0078D4,
        stop:1 #005A9E
    );
    color: white;
}
"""

# 菜单样式 - Fluent Design
MENU_STYLE = """
QMenu {
    background-color: white;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    padding: 6px;
}

QMenu::item {
    padding: 10px 36px 10px 36px;
    border-radius: 6px;
    color: #333333;
}

QMenu::item:selected {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #E8F4FD,
        stop:1 #D0E8FA
    );
    color: #0078D4;
}

QMenu::separator {
    height: 1px;
    background-color: #E0E0E0;
    margin: 6px 12px;
}
"""

# 工具栏样式 - Fluent Design
TOOLBAR_STYLE = """
QToolBar {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #FAFAFA,
        stop:1 #F5F5F5
    );
    border-bottom: 1px solid #E0E0E0;
    spacing: 6px;
    padding: 8px;
}

QToolBar::separator {
    background-color: #E0E0E0;
    width: 1px;
    margin: 8px 6px;
}

QToolButton {
    background-color: transparent;
    border: none;
    border-radius: 6px;
    padding: 8px;
    color: #333333;
}

QToolButton:hover {
    background-color: #F3F3F3;
}

QToolButton:pressed {
    background: qlineargradient(
        x1:0, y1:0, x2:0, y2:1,
        stop:0 #E0E0E0,
        stop:1 #D0D0D0
    );
}
"""

# 滚动条样式 - Fluent Design
SCROLLBAR_STYLE = """
QScrollBar:vertical {
    border: none;
    background-color: transparent;
    width: 14px;
    margin: 0px;
}

QScrollBar::handle:vertical {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 7px;
    min-height: 40px;
    margin: 2px;
}

QScrollBar::handle:vertical:hover {
    background-color: rgba(0, 0, 0, 0.5);
}

QScrollBar::add-line:vertical,
QScrollBar::sub-line:vertical {
    height: 0px;
}

QScrollBar::add-page:vertical,
QScrollBar::sub-page:vertical {
    background: none;
}

QScrollBar:horizontal {
    border: none;
    background-color: transparent;
    height: 14px;
    margin: 0px;
}

QScrollBar::handle:horizontal {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 7px;
    min-width: 40px;
    margin: 2px;
}

QScrollBar::handle:horizontal:hover {
    background-color: rgba(0, 0, 0, 0.5);
}

QScrollBar::add-line:horizontal,
QScrollBar::sub-line:horizontal {
    width: 0px;
}

QScrollBar::add-page:horizontal,
QScrollBar::sub-page:horizontal {
    background: none;
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
