# Claude Code 项目指南

> 本文档为 Claude Code 提供项目的核心信息和开发指南

---

## 📋 项目概述

**项目名称**: 对标账号管理软件
**版本**: 1.0.1
**技术栈**: Python 3.10+ / PyQt5 / SQLite3
**开发日期**: 2025-01-15

**项目功能**:
- 📊 对标账号管理（添加、编辑、删除、搜索）
- 📝 文章管理（添加、编辑、删除、搜索、标签）
- 📤 数据导出（Excel、JSON、Markdown）
- 🎨 Material Design 风格界面
- 💾 本地 SQLite 数据库存储

---

## 🏗️ 项目架构

### 分层架构

```
┌─────────────────────────────────────┐
│         UI Layer (PyQt5)            │
│  MainWindow, Dialogs, Widgets       │
├─────────────────────────────────────┤
│       Business Logic Layer          │
│  AccountManager, ArticleManager     │
├─────────────────────────────────────┤
│         Data Access Layer           │
│       Database (SQLite)             │
├─────────────────────────────────────┤
│          Utils Layer                │
│   Logger, Config, Validators        │
└─────────────────────────────────────┘
```

### 核心模块

1. **UI 层** (`src/main/python/ui/`)
   - `main_window.py` - 主窗口（左右分栏布局）
   - `widgets/` - 自定义组件（账号列表、文章列表）
   - `dialogs/` - 对话框（添加账号、添加文章）
   - `styles.py` - 全局样式定义

2. **业务逻辑层** (`src/main/python/core/`)
   - `account_manager.py` - 账号管理逻辑
   - `article_manager.py` - 文章管理逻辑
   - `export_manager.py` - 数据导出逻辑
   - `database.py` - 数据库操作封装

3. **工具层** (`src/main/python/utils/`)
   - `logger.py` - 日志系统
   - `config.py` - 配置管理
   - `validators.py` - 数据验证

---

## 📁 目录结构

```
对标账号管理软件/
├── src/
│   └── main/
│       └── python/              # Python 源代码
│           ├── main.py          # 应用程序入口 ⭐
│           ├── core/            # 核心业务逻辑
│           │   ├── database.py
│           │   ├── account_manager.py
│           │   ├── article_manager.py
│           │   └── export_manager.py
│           ├── ui/              # 界面层
│           │   ├── main_window.py
│           │   ├── styles.py
│           │   ├── widgets/     # 自定义组件
│           │   └── dialogs/     # 对话框
│           └── utils/           # 工具函数
│               ├── logger.py
│               ├── config.py
│               └── validators.py
├── data/                        # 数据文件（运行时生成）
│   └── database.db             # SQLite 数据库
├── logs/                        # 日志文件（运行时生成）
│   └── app.log
├── output/                      # 导出文件输出目录
├── docs/                        # 文档
│   └── claude.md               # 本文档
├── tests/                       # 测试文件
├── .github/workflows/           # GitHub Actions
│   └── release.yml             # 自动打包配置 ⭐
├── build.spec                   # PyInstaller 配置 ⭐
├── build.bat                    # 本地打包脚本
├── requirements.txt             # Python 依赖
├── test_all_imports.py          # 导入测试
├── test_functions.py            # 功能测试
└── README.md
```

---

## 🎯 关键文件说明

### 入口文件
- **`src/main/python/main.py`** (182行)
  - 应用程序启动入口
  - 初始化日志、路径、数据库
  - 创建并显示主窗口

### UI 主窗口
- **`src/main/python/ui/main_window.py`** (400+行)
  - 左右分栏布局
  - 左侧：账号列表 + 操作按钮
  - 右侧：文章列表 + 详情
  - **TODO**: 部分功能需要连接到业务逻辑层（243、269、292、314行）

### 数据库层
- **`src/main/python/core/database.py`**
  - SQLite 封装
  - 事务管理
  - 连接池管理
  - 表结构：`accounts`, `articles`

### 打包配置
- **`build.spec`** - PyInstaller 配置
- **`.github/workflows/release.yml`** - GitHub Actions 自动打包

---

## 🔧 开发环境设置

### 安装依赖

```bash
pip install -r requirements.txt
```

### 运行应用

```bash
# 标准模式
python src/main/python/main.py

# 调试模式（详细日志）
python src/main/python/main.py --debug
```

### 测试

```bash
# 测试所有模块导入
python test_all_imports.py

# 测试功能
python test_functions.py

# 测试数据库
python src/test/test_database.py
```

---

## 📦 打包发布

### 本地打包

```bash
# Windows 一键打包
build.bat

# 或手动执行
pyinstaller --clean build.spec
```

### GitHub Actions 自动打包

```bash
# 创建 release tag 触发自动构建
git tag v1.0.2
git push origin v1.0.2
```

**注意**: Tag 必须以 `v` 开头，如 `v1.0.0`

---

## 💡 开发规范

### 代码风格

- 使用 **UTF-8** 编码
- 每个文件顶部添加文档字符串
- 函数和类添加注释说明
- 遵循 PEP 8 规范

### 命名规范

- **类名**: PascalCase （如 `AccountManager`）
- **函数/变量**: snake_case （如 `get_account`）
- **常量**: UPPER_CASE （如 `BUTTON_STYLE`）
- **私有成员**: `_` 前缀 （如 `_validate_data`）

### 导入顺序

```python
# 1. 标准库
import sys
import os

# 2. 第三方库
from PyQt5.QtWidgets import QMainWindow

# 3. 本地模块
from core.database import Database
```

### 日志记录

```python
from utils.logger import get_logger

logger = get_logger(__name__)
logger.info("操作成功")
logger.error("操作失败", exc_info=True)
```

---

## ⚠️ 已知问题和 TODO

### UI 集成待完成（优先级：高）

| 位置 | 功能 | 状态 |
|------|------|------|
| `main_window.py:243` | 添加账号功能集成 | ⚠️ TODO |
| `main_window.py:269` | 添加文章功能集成 | ⚠️ TODO |
| `main_window.py:292` | 导出功能集成 | ⚠️ TODO |
| `main_window.py:314` | 状态栏统计集成 | ⚠️ TODO |

**说明**: 核心业务逻辑已完整实现并测试通过，只需要在 UI 层调用相应的 Manager。

### 数据库优化（优先级：中）

- [ ] 添加数据库迁移机制
- [ ] 实现数据库备份功能
- [ ] 优化查询性能（添加索引）

### 功能增强（优先级：低）

- [ ] 添加账号分组功能
- [ ] 支持批量导入账号
- [ ] 添加数据统计图表
- [ ] 支持自定义标签颜色

---

## 🐛 常见问题

### Q1: 打包后运行报错 "No module named 'ui'"

**A**: 已在 v1.0.1 修复，确保使用最新的 `build.spec` 配置。

**解决方案**:
- 更新 `hiddenimports` 列表，包含所有子模块
- 参考 `build.spec` 的完整配置

### Q2: 数据库路径问题

**A**: 数据库文件位于 `data/database.db`，相对于可执行文件目录。

**代码位置**: `main.py:78-82`

### Q3: 中文编码问题

**A**: Windows 系统需要设置 UTF-8 输出。

**解决方案**:
```python
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
```

---

## 📊 数据库结构

### accounts 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 账号名称（唯一） |
| category | TEXT | 分类 |
| description | TEXT | 描述 |
| avatar_url | TEXT | 头像URL |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### articles 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| account_id | INTEGER | 外键 → accounts.id |
| title | TEXT | 文章标题 |
| url | TEXT | 文章链接 |
| publish_date | DATE | 发布日期 |
| cover_image | TEXT | 封面图 |
| summary | TEXT | 摘要 |
| tags | TEXT | 标签（逗号分隔） |
| author | TEXT | 作者 |
| created_at | TIMESTAMP | 创建时间 |

**约束**:
- `(account_id, url)` 唯一约束
- 外键级联删除

---

## 🚀 快速定位代码

### 修改 UI 样式
- `src/main/python/ui/styles.py` - 全局样式定义
- Material Design 风格，蓝色主题色

### 添加新功能
1. **业务逻辑**: `src/main/python/core/`
2. **UI 界面**: `src/main/python/ui/`
3. **测试**: `tests/` 或 `test_*.py`

### 修改数据库结构
- `src/main/python/core/database.py:42-117` - 表创建 SQL

### 添加导出格式
- `src/main/python/core/export_manager.py` - 导出功能

---

## 📝 提交规范

```bash
git commit -m "类型: 简短描述

详细说明（可选）

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**类型**:
- `feat` - 新功能
- `fix` - 修复 bug
- `docs` - 文档更新
- `style` - 代码格式
- `refactor` - 重构
- `test` - 测试相关
- `chore` - 构建/工具相关

---

## 🔗 相关文档

- **用户手册**: `docs/用户文档.md`
- **开发文档**: `docs/开发文档.md`
- **发布说明**: `发布说明.md`
- **更新日志**: `CHANGELOG.md`

---

## 📞 技术支持

- **GitHub Issues**: 报告 bug 或功能请求
- **项目仓库**: https://github.com/wsir78933-rgb/wechat-desktop-app

---

**最后更新**: 2025-10-08
**文档版本**: 1.0
