"""
Manager类功能测试脚本
测试AccountManager、ArticleManager、ExportManager的核心功能
"""
import sys
import os
from pathlib import Path

# 添加项目路径到sys.path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "src" / "main" / "python"))

from core import Database, AccountManager, ArticleManager, ExportManager
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def test_database():
    """测试数据库连接"""
    print("\n========== 测试数据库连接 ==========")
    try:
        db = Database("test_database.db")
        print("✓ 数据库连接成功")
        return db
    except Exception as e:
        print(f"✗ 数据库连接失败: {e}")
        return None


def test_account_manager(db):
    """测试账号管理器"""
    print("\n========== 测试账号管理器 ==========")

    account_manager = AccountManager(db)

    # 1. 添加账号
    print("\n1. 测试添加账号...")
    account_id = account_manager.add_account(
        name="测试账号",
        category="科技",
        description="这是一个测试账号",
        avatar_url="https://example.com/avatar.jpg"
    )

    if account_id:
        print(f"✓ 添加账号成功，ID: {account_id}")
    else:
        print("✗ 添加账号失败")
        return None

    # 2. 获取账号
    print("\n2. 测试获取账号...")
    account = account_manager.get_account(account_id)
    if account:
        print(f"✓ 获取账号成功: {account['name']}")
        print(f"  分类: {account['category']}")
        print(f"  描述: {account['description']}")
    else:
        print("✗ 获取账号失败")

    # 3. 更新账号
    print("\n3. 测试更新账号...")
    success = account_manager.update_account(
        account_id,
        description="更新后的描述"
    )
    print(f"{'✓' if success else '✗'} 更新账号{'成功' if success else '失败'}")

    # 4. 获取所有账号
    print("\n4. 测试获取所有账号...")
    accounts = account_manager.get_all_accounts()
    print(f"✓ 获取所有账号成功，共 {len(accounts)} 个账号")

    # 5. 搜索账号
    print("\n5. 测试搜索账号...")
    results = account_manager.search_accounts("测试")
    print(f"✓ 搜索成功，找到 {len(results)} 个结果")

    return account_id


def test_article_manager(db, account_id):
    """测试文章管理器"""
    print("\n========== 测试文章管理器 ==========")

    article_manager = ArticleManager(db)

    # 1. 添加文章
    print("\n1. 测试添加文章...")
    article_id = article_manager.add_article(
        account_id=account_id,
        title="测试文章标题",
        url="https://example.com/article1",
        publish_date="2025-01-15",
        author="测试作者",
        tags="Python, 测试",
        summary="这是一篇测试文章的摘要"
    )

    if article_id:
        print(f"✓ 添加文章成功，ID: {article_id}")
    else:
        print("✗ 添加文章失败")
        return None

    # 2. 批量添加文章
    print("\n2. 测试批量添加文章...")
    articles_data = [
        {
            'account_id': account_id,
            'title': '批量文章1',
            'url': 'https://example.com/article2',
            'publish_date': '2025-01-16',
            'tags': 'Python'
        },
        {
            'account_id': account_id,
            'title': '批量文章2',
            'url': 'https://example.com/article3',
            'publish_date': '2025-01-17',
            'tags': 'Python, Django'
        }
    ]

    success, success_count, fail_count = article_manager.batch_add_articles(articles_data)
    print(f"{'✓' if success else '✗'} 批量添加文章{'成功' if success else '失败'}")
    print(f"  成功: {success_count} 篇，失败: {fail_count} 篇")

    # 3. 获取文章
    print("\n3. 测试获取文章...")
    article = article_manager.get_article(article_id)
    if article:
        print(f"✓ 获取文章成功: {article['title']}")
        print(f"  账号: {article['account_name']}")
        print(f"  发布日期: {article['publish_date']}")
    else:
        print("✗ 获取文章失败")

    # 4. 获取账号下的文章
    print("\n4. 测试获取账号下的文章...")
    articles = article_manager.get_articles_by_account(account_id)
    print(f"✓ 获取账号文章成功，共 {len(articles)} 篇")
    for idx, art in enumerate(articles, 1):
        print(f"  {idx}. {art['title']}")

    # 5. 更新文章
    print("\n5. 测试更新文章...")
    success = article_manager.update_article(
        article_id,
        summary="更新后的摘要内容"
    )
    print(f"{'✓' if success else '✗'} 更新文章{'成功' if success else '失败'}")

    # 6. 搜索文章
    print("\n6. 测试搜索文章...")
    results = article_manager.search_articles("测试", account_id=account_id)
    print(f"✓ 搜索成功，找到 {len(results)} 篇文章")

    # 7. 获取文章总数
    print("\n7. 测试获取文章总数...")
    count = article_manager.get_article_count(account_id)
    print(f"✓ 文章总数: {count}")

    return articles


def test_export_manager(db, account_id):
    """测试导出管理器"""
    print("\n========== 测试导出管理器 ==========")

    account_manager = AccountManager(db)
    article_manager = ArticleManager(db)

    # 获取数据
    accounts = account_manager.get_all_accounts()
    articles = article_manager.get_all_articles()

    # 创建输出目录
    output_dir = Path("test_output")
    output_dir.mkdir(exist_ok=True)

    # 1. 测试Excel导出
    print("\n1. 测试Excel导出...")
    excel_path = output_dir / "test_export.xlsx"
    success = ExportManager.export_to_excel(accounts, articles, str(excel_path))
    print(f"{'✓' if success else '✗'} Excel导出{'成功' if success else '失败'}")
    if success:
        print(f"  文件路径: {excel_path.absolute()}")

    # 2. 测试JSON导出
    print("\n2. 测试JSON导出...")
    json_path = output_dir / "test_export.json"
    success = ExportManager.export_to_json(accounts, articles, str(json_path))
    print(f"{'✓' if success else '✗'} JSON导出{'成功' if success else '失败'}")
    if success:
        print(f"  文件路径: {json_path.absolute()}")

    # 3. 测试Markdown导出
    print("\n3. 测试Markdown导出...")
    md_path = output_dir / "test_export.md"
    success = ExportManager.export_to_markdown(accounts, articles, str(md_path))
    print(f"{'✓' if success else '✗'} Markdown导出{'成功' if success else '失败'}")
    if success:
        print(f"  文件路径: {md_path.absolute()}")


def cleanup():
    """清理测试数据"""
    print("\n========== 清理测试数据 ==========")
    try:
        if os.path.exists("test_database.db"):
            os.remove("test_database.db")
            print("✓ 测试数据库已删除")
    except Exception as e:
        print(f"✗ 清理失败: {e}")


def main():
    """主测试函数"""
    print("=" * 50)
    print("Manager类功能测试")
    print("=" * 50)

    try:
        # 测试数据库
        db = test_database()
        if not db:
            return

        # 测试账号管理器
        account_id = test_account_manager(db)
        if not account_id:
            return

        # 测试文章管理器
        articles = test_article_manager(db, account_id)

        # 测试导出管理器
        test_export_manager(db, account_id)

        print("\n" + "=" * 50)
        print("✓ 所有测试完成")
        print("=" * 50)

    except Exception as e:
        print(f"\n✗ 测试出错: {e}")
        import traceback
        traceback.print_exc()

    finally:
        # 清理测试数据
        cleanup()


if __name__ == "__main__":
    main()
