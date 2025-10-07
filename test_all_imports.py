# -*- coding: utf-8 -*-
"""
完整的导入路径测试脚本
测试项目中所有主要模块的导入是否正常
"""
import sys
import os
import io

# 设置标准输出为UTF-8编码（Windows兼容性）
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 添加src/main/python到路径
current_dir = os.path.dirname(os.path.abspath(__file__))
src_path = os.path.join(current_dir, 'src', 'main', 'python')
sys.path.insert(0, src_path)

print("="*60)
print("开始测试所有模块导入...")
print("="*60)
print(f"Python路径: {src_path}")
print()

test_results = []

def test_import(module_name, import_statement):
    """测试单个模块导入"""
    try:
        exec(import_statement)
        print(f"[OK]  {module_name:40s} SUCCESS")
        test_results.append((module_name, True, None))
        return True
    except Exception as e:
        print(f"[FAIL] {module_name:40s} ERROR: {str(e)}")
        test_results.append((module_name, False, str(e)))
        return False

# 测试核心模块
print("\n【核心模块 Core】")
test_import("core.database", "from core.database import Database, transaction")
test_import("core.account_manager", "from core.account_manager import AccountManager")
test_import("core.article_manager", "from core.article_manager import ArticleManager")
test_import("core.export_manager", "from core.export_manager import ExportManager")

# 测试工具模块
print("\n【工具模块 Utils】")
test_import("utils.logger", "from utils.logger import Logger, get_logger")
test_import("utils.config", "from utils.config import Config, get_config")
test_import("utils.validators", "from utils.validators import URLValidator, validate_url")

# 测试UI样式
print("\n【UI样式 Styles】")
test_import("ui.styles", "from ui.styles import FULL_STYLE, BUTTON_STYLE")

# 测试UI组件
print("\n【UI组件 Widgets】")
test_import("ui.widgets.account_list_widget", "from ui.widgets.account_list_widget import AccountListWidget")
test_import("ui.widgets.article_list_widget", "from ui.widgets.article_list_widget import ArticleListWidget")
test_import("ui.widgets", "from ui.widgets import AccountListWidget, ArticleListWidget")

# 测试UI对话框
print("\n【UI对话框 Dialogs】")
test_import("ui.dialogs.add_account_dialog", "from ui.dialogs.add_account_dialog import AddAccountDialog")
test_import("ui.dialogs.add_article_dialog", "from ui.dialogs.add_article_dialog import AddArticleDialog")
test_import("ui.dialogs", "from ui.dialogs import AddAccountDialog, AddArticleDialog")

# 测试主窗口
print("\n【主窗口 MainWindow】")
test_import("ui.main_window", "from ui.main_window import MainWindow")

# 测试主程序
print("\n【主程序 Main】")
test_import("main", "import main")

# 统计结果
print("\n" + "="*60)
print("测试结果汇总")
print("="*60)

total = len(test_results)
success = sum(1 for _, result, _ in test_results if result)
failed = total - success

print(f"Total: {total} modules")
print(f"Success: {success} modules [OK]")
print(f"Failed: {failed} modules [FAIL]")
print()

if failed > 0:
    print("Failed modules:")
    for name, result, error in test_results:
        if not result:
            print(f"  - {name}: {error}")
    print()
    print("[FAIL] Import errors detected, please check path configuration")
    sys.exit(1)
else:
    print("[SUCCESS] All modules imported successfully!")
    sys.exit(0)
