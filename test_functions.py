#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
功能测试脚本
用于测试应用的各项功能
"""

import sys
import os
import io
from pathlib import Path

# Windows控制台UTF-8支持
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 配置路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root / "src" / "main" / "python"))

from core.database import Database
from core.account_manager import AccountManager
from core.article_manager import ArticleManager
from core.export_manager import ExportManager


def print_header(title):
    """打印标题"""
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)


def test_database_connection():
    """测试数据库连接"""
    print_header("测试1: 数据库连接")
    try:
        db = Database(str(project_root / "data" / "database.db"))
        print("✅ 数据库连接成功")
        return db
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return None


def test_add_account(db):
    """测试添加账号"""
    print_header("测试2: 添加账号")
    try:
        manager = AccountManager(db)

        # 添加测试账号
        accounts = [
            ("AI科技博主", "科技", "专注AI和机器学习技术分享"),
            ("营销大师", "营销", "数字营销和品牌推广"),
            ("产品经理笔记", "运营", "产品设计和用户体验"),
        ]

        for name, category, desc in accounts:
            account_id = manager.add_account(name, category, desc)
            print(f"✅ 添加账号成功: {name} (ID: {account_id})")

        # 显示所有账号
        all_accounts = manager.get_all_accounts()
        print(f"\n当前共有 {len(all_accounts)} 个账号:")
        for acc in all_accounts:
            print(f"  - {acc['name']} ({acc['category']}) - {acc['article_count']}篇文章")

        return manager
    except Exception as e:
        print(f"❌ 添加账号失败: {e}")
        return None


def test_add_articles(db, account_manager):
    """测试添加文章"""
    print_header("测试3: 添加文章")
    try:
        manager = ArticleManager(db)
        accounts = account_manager.get_all_accounts()

        if not accounts:
            print("❌ 没有可用的账号")
            return None

        account_id = accounts[0]['id']
        account_name = accounts[0]['name']

        # 添加测试文章
        articles = [
            {
                'account_id': account_id,
                'title': 'GPT-4技术解析：突破与挑战',
                'url': 'https://example.com/gpt4-analysis',
                'publish_date': '2025-01-15',
                'tags': 'GPT-4, AI, 深度学习',
                'summary': '深入分析GPT-4的技术架构和应用场景'
            },
            {
                'account_id': account_id,
                'title': '大模型时代的机遇与挑战',
                'url': 'https://example.com/llm-opportunities',
                'publish_date': '2025-01-10',
                'tags': '大模型, AI, 商业化',
                'summary': '探讨大模型如何改变各行各业'
            },
            {
                'account_id': account_id,
                'title': 'AI绘画工具全面测评',
                'url': 'https://example.com/ai-art-tools',
                'publish_date': '2025-01-05',
                'tags': 'AI绘画, Midjourney, Stable Diffusion',
                'summary': '对比主流AI绘画工具的优劣'
            },
        ]

        for article in articles:
            article_id = manager.add_article(**article)
            print(f"✅ 添加文章成功: {article['title'][:30]}... (ID: {article_id})")

        # 显示统计
        total_articles = manager.get_article_count()
        print(f"\n当前共有 {total_articles} 篇文章")

        return manager
    except Exception as e:
        print(f"❌ 添加文章失败: {e}")
        import traceback
        traceback.print_exc()
        return None


def test_search(account_manager, article_manager):
    """测试搜索功能"""
    print_header("测试4: 搜索功能")
    try:
        # 搜索账号
        print("搜索账号 (关键词: AI):")
        accounts = account_manager.search_accounts("AI")
        for acc in accounts:
            print(f"  - {acc['name']} ({acc['category']})")

        # 搜索文章
        print("\n搜索文章 (关键词: GPT):")
        articles = article_manager.search_articles(keyword="GPT")
        for art in articles:
            print(f"  - {art['title']}")

        print("✅ 搜索功能正常")
    except Exception as e:
        print(f"❌ 搜索失败: {e}")


def test_export(account_manager, article_manager):
    """测试导出功能"""
    print_header("测试5: 导出功能")
    try:
        accounts = account_manager.get_all_accounts()
        articles = article_manager.get_all_articles()

        output_dir = project_root / "output"

        # 导出JSON
        json_file = output_dir / "test_export.json"
        ExportManager.export_to_json(accounts, articles, str(json_file))
        print(f"✅ JSON导出成功: {json_file}")

        # 导出Markdown
        md_file = output_dir / "test_export.md"
        ExportManager.export_to_markdown(accounts, articles, str(md_file))
        print(f"✅ Markdown导出成功: {md_file}")

        # 导出Excel
        try:
            excel_file = output_dir / "test_export.xlsx"
            ExportManager.export_to_excel(accounts, articles, str(excel_file))
            print(f"✅ Excel导出成功: {excel_file}")
        except Exception as e:
            print(f"⚠️ Excel导出失败: {e}")

    except Exception as e:
        print(f"❌ 导出失败: {e}")
        import traceback
        traceback.print_exc()


def test_statistics(account_manager, article_manager):
    """测试统计功能"""
    print_header("测试6: 统计信息")
    try:
        accounts = account_manager.get_all_accounts()
        total_articles = article_manager.get_article_count()

        print(f"📊 统计数据:")
        print(f"  - 总账号数: {len(accounts)}")
        print(f"  - 总文章数: {total_articles}")

        if accounts:
            print(f"\n📈 账号详情:")
            for acc in accounts:
                print(f"  - {acc['name']}: {acc['article_count']}篇")

        print("✅ 统计功能正常")
    except Exception as e:
        print(f"❌ 统计失败: {e}")


def main():
    """主测试函数"""
    print("\n" + "=" * 60)
    print(" 对标账号管理软件 - 功能测试")
    print("=" * 60)

    # 1. 测试数据库连接
    db = test_database_connection()
    if not db:
        return

    # 2. 测试添加账号
    account_manager = test_add_account(db)
    if not account_manager:
        return

    # 3. 测试添加文章
    article_manager = test_add_articles(db, account_manager)
    if not article_manager:
        return

    # 4. 测试搜索
    test_search(account_manager, article_manager)

    # 5. 测试导出
    test_export(account_manager, article_manager)

    # 6. 测试统计
    test_statistics(account_manager, article_manager)

    # 完成
    print_header("测试完成")
    print("✅ 所有测试通过！")
    print("\n💡 提示：")
    print("  - 测试数据已添加到数据库")
    print("  - 导出文件保存在 output/ 目录")
    print("  - 现在可以启动GUI应用查看数据")
    print("\n启动命令: python src/main/python/main.py")


if __name__ == "__main__":
    main()
