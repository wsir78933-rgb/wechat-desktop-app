"""
UI组件测试脚本
用于测试新创建的UI组件
"""
import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QWidget, QHBoxLayout, QSplitter
from PyQt5.QtCore import Qt

# 导入UI组件
from ui.widgets import AccountListWidget, ArticleListWidget
from ui.dialogs import AddAccountDialog, AddArticleDialog
from ui import FULL_STYLE


class TestMainWindow(QMainWindow):
    """测试主窗口"""

    def __init__(self):
        super().__init__()
        self.init_ui()

    def init_ui(self):
        """初始化UI"""
        self.setWindowTitle("UI组件测试 - 对标账号管理软件")
        self.setMinimumSize(1000, 600)
        self.resize(1280, 800)

        # 应用样式
        self.setStyleSheet(FULL_STYLE)

        # 创建中心部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # 创建主布局
        main_layout = QHBoxLayout(central_widget)

        # 创建分栏容器
        splitter = QSplitter(Qt.Horizontal)

        # 左侧:账号列表
        self.account_list_widget = AccountListWidget()
        splitter.addWidget(self.account_list_widget)

        # 右侧:文章列表
        self.article_list_widget = ArticleListWidget()
        splitter.addWidget(self.article_list_widget)

        # 设置分栏比例(30% : 70%)
        splitter.setStretchFactor(0, 3)
        splitter.setStretchFactor(1, 7)

        main_layout.addWidget(splitter)

        # 连接信号
        self.account_list_widget.account_selected.connect(
            self.on_account_selected
        )

        # 加载mock数据
        self.account_list_widget.load_accounts()
        self.article_list_widget.show_empty_message()

        # 创建状态栏
        self.statusBar().showMessage("就绪 | UI组件测试模式")

        print("✅ UI组件加载成功!")
        print("💡 左侧点击账号即可查看文章列表")

    def on_account_selected(self, account_id: int):
        """账号被选中"""
        print(f"📌 选中账号ID: {account_id}")
        self.article_list_widget.load_articles(account_id)
        self.statusBar().showMessage(f"已加载账号 {account_id} 的文章列表")


def test_account_dialog():
    """测试添加账号对话框"""
    print("\n" + "="*50)
    print("测试添加账号对话框...")
    print("="*50)

    app = QApplication.instance() or QApplication(sys.argv)

    # 测试添加模式
    ok, data = AddAccountDialog.get_account_data()
    if ok:
        print("✅ 添加账号成功:")
        print(f"   账号名称: {data['name']}")
        print(f"   账号分类: {data['category']}")
        print(f"   账号描述: {data['description']}")
        print(f"   头像链接: {data['avatar_url']}")
    else:
        print("❌ 用户取消添加")


def test_article_dialog():
    """测试添加文章对话框"""
    print("\n" + "="*50)
    print("测试添加文章对话框...")
    print("="*50)

    app = QApplication.instance() or QApplication(sys.argv)

    # Mock账号列表
    mock_accounts = [
        {'id': 1, 'name': '张三', 'category': '科技'},
        {'id': 2, 'name': '李四', 'category': '营销'},
    ]

    # 测试添加模式
    ok, data, continue_adding = AddArticleDialog.get_article_data(
        accounts=mock_accounts
    )

    if ok:
        print("✅ 添加文章成功:")
        print(f"   账号ID: {data['account_id']}")
        print(f"   文章标题: {data['title']}")
        print(f"   文章链接: {data['url']}")
        print(f"   发布日期: {data['publish_date']}")
        print(f"   标签: {data['tags']}")
        print(f"   继续添加: {continue_adding}")
    else:
        print("❌ 用户取消添加")


def main():
    """主函数"""
    print("\n" + "="*50)
    print("🎨 PyQt5 UI组件测试")
    print("="*50)
    print()
    print("已创建的组件:")
    print("  ✅ 1. 样式文件 (ui/styles.py)")
    print("  ✅ 2. 账号列表组件 (ui/widgets/account_list_widget.py)")
    print("  ✅ 3. 文章列表组件 (ui/widgets/article_list_widget.py)")
    print("  ✅ 4. 添加账号对话框 (ui/dialogs/add_account_dialog.py)")
    print("  ✅ 5. 添加文章对话框 (ui/dialogs/add_article_dialog.py)")
    print()
    print("测试选项:")
    print("  1. 测试主窗口布局(左右分栏)")
    print("  2. 测试添加账号对话框")
    print("  3. 测试添加文章对话框")
    print("  4. 全部测试")
    print()

    choice = input("请选择测试选项 (1-4): ").strip()

    app = QApplication(sys.argv)

    if choice == '1':
        window = TestMainWindow()
        window.show()
        sys.exit(app.exec_())
    elif choice == '2':
        test_account_dialog()
    elif choice == '3':
        test_article_dialog()
    elif choice == '4':
        window = TestMainWindow()
        window.show()
        sys.exit(app.exec_())
    else:
        print("❌ 无效的选择!")


if __name__ == '__main__':
    main()
