"""
数据库模块测试脚本
验证数据库初始化和基本操作
"""

import sys
import os
from pathlib import Path

# 设置UTF-8编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 添加src/main/python到系统路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "main" / "python"))

from core.database import Database


def test_database_initialization():
    """测试数据库初始化"""
    print("=" * 50)
    print("测试数据库初始化")
    print("=" * 50)

    try:
        # 使用测试数据库
        db = Database("data/test_accounts.db")
        print("✓ 数据库连接成功")

        # 检查表是否创建
        cursor = db.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name IN ('accounts', 'articles')
        """)
        tables = [row[0] for row in cursor.fetchall()]

        print(f"✓ 已创建表: {', '.join(tables)}")

        if 'accounts' in tables and 'articles' in tables:
            print("✓ 数据库表结构完整")
        else:
            print("✗ 数据库表结构不完整")
            return False

        # 检查索引
        cursor = db.execute("""
            SELECT name FROM sqlite_master
            WHERE type='index'
        """)
        indexes = [row[0] for row in cursor.fetchall()]
        print(f"✓ 已创建索引: {len(indexes)} 个")

        return True

    except Exception as e:
        print(f"✗ 数据库初始化失败: {e}")
        return False


def test_account_operations():
    """测试账号基本操作"""
    print("\n" + "=" * 50)
    print("测试账号CRUD操作")
    print("=" * 50)

    try:
        db = Database("data/test_accounts.db")

        # 1. 添加账号
        print("\n1. 测试添加账号...")
        account_id = db.execute("""
            INSERT INTO accounts (name, category, description)
            VALUES (?, ?, ?)
        """, ("测试账号", "测试分类", "这是一个测试账号")).lastrowid
        db.commit()
        print(f"✓ 成功添加账号，ID: {account_id}")

        # 2. 查询账号
        print("\n2. 测试查询账号...")
        account = db.fetchone("""
            SELECT * FROM accounts WHERE id = ?
        """, (account_id,))

        if account:
            print(f"✓ 查询成功")
            print(f"   账号名称: {account['name']}")
            print(f"   账号分类: {account['category']}")
            print(f"   创建时间: {account['created_at']}")
        else:
            print("✗ 查询失败")
            return False

        # 3. 更新账号
        print("\n3. 测试更新账号...")
        db.execute("""
            UPDATE accounts
            SET description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, ("更新后的描述", account_id))
        db.commit()

        updated_account = db.fetchone("""
            SELECT * FROM accounts WHERE id = ?
        """, (account_id,))

        if updated_account['description'] == "更新后的描述":
            print("✓ 更新成功")
        else:
            print("✗ 更新失败")
            return False

        # 4. 添加文章
        print("\n4. 测试添加文章...")
        article_id = db.execute("""
            INSERT INTO articles (account_id, title, url, publish_date)
            VALUES (?, ?, ?, ?)
        """, (account_id, "测试文章", "https://example.com/article1", "2025-01-01")).lastrowid
        db.commit()
        print(f"✓ 成功添加文章，ID: {article_id}")

        # 5. 查询文章
        print("\n5. 测试查询文章...")
        articles = db.fetchall("""
            SELECT * FROM articles WHERE account_id = ?
        """, (account_id,))
        print(f"✓ 查询到 {len(articles)} 篇文章")

        # 6. 测试外键约束（级联删除）
        print("\n6. 测试外键约束...")
        db.execute("DELETE FROM accounts WHERE id = ?", (account_id,))
        db.commit()

        remaining_articles = db.fetchall("""
            SELECT * FROM articles WHERE account_id = ?
        """, (account_id,))

        if len(remaining_articles) == 0:
            print("✓ 外键级联删除成功")
        else:
            print("✗ 外键级联删除失败")
            return False

        return True

    except Exception as e:
        print(f"✗ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_transaction():
    """测试事务管理"""
    print("\n" + "=" * 50)
    print("测试事务管理")
    print("=" * 50)

    try:
        db = Database("data/test_accounts.db")

        # 测试事务提交
        print("\n1. 测试事务提交...")
        db.execute("BEGIN")
        account_id = db.execute("""
            INSERT INTO accounts (name, category)
            VALUES (?, ?)
        """, ("事务测试账号", "测试")).lastrowid
        db.commit()

        account = db.fetchone("SELECT * FROM accounts WHERE id = ?", (account_id,))
        if account:
            print("✓ 事务提交成功")
        else:
            print("✗ 事务提交失败")
            return False

        # 测试事务回滚
        print("\n2. 测试事务回滚...")
        db.execute("BEGIN")
        db.execute("""
            UPDATE accounts SET name = ? WHERE id = ?
        """, ("修改后的名称", account_id))
        db.rollback()

        account = db.fetchone("SELECT * FROM accounts WHERE id = ?", (account_id,))
        if account['name'] == "事务测试账号":
            print("✓ 事务回滚成功")
        else:
            print("✗ 事务回滚失败")
            return False

        # 清理
        db.execute("DELETE FROM accounts WHERE id = ?", (account_id,))
        db.commit()

        return True

    except Exception as e:
        print(f"✗ 测试失败: {e}")
        return False


def cleanup_test_database():
    """清理测试数据库"""
    test_db_path = Path("data/test_accounts.db")
    if test_db_path.exists():
        test_db_path.unlink()
        print("\n✓ 测试数据库已清理")


if __name__ == "__main__":
    print("\n对标账号管理软件 - 数据库模块测试\n")

    results = []

    # 运行测试
    results.append(("数据库初始化", test_database_initialization()))
    results.append(("账号操作", test_account_operations()))
    results.append(("事务管理", test_transaction()))

    # 显示测试结果
    print("\n" + "=" * 50)
    print("测试结果汇总")
    print("=" * 50)

    for test_name, result in results:
        status = "通过" if result else "失败"
        symbol = "✓" if result else "✗"
        print(f"{symbol} {test_name}: {status}")

    all_passed = all(result for _, result in results)
    print("\n" + "=" * 50)
    if all_passed:
        print("所有测试通过！")
    else:
        print("部分测试失败，请检查错误信息")
    print("=" * 50)

    # 清理测试数据库
    cleanup_test_database()

    sys.exit(0 if all_passed else 1)
