# 对标账号管理软件

[![Python Application CI/CD](https://github.com/wsir78933-rgb/wechat-desktop-app/actions/workflows/python-app.yml/badge.svg)](https://github.com/wsir78933-rgb/wechat-desktop-app/actions/workflows/python-app.yml)
[![Release Build](https://github.com/wsir78933-rgb/wechat-desktop-app/actions/workflows/release.yml/badge.svg)](https://github.com/wsir78933-rgb/wechat-desktop-app/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue)](https://www.python.org/downloads/)

一款基于 Python + PyQt5 的桌面应用程序，用于管理对标账号和文章，方便内容创作者进行对标研究和内容收集。

## 📸 界面预览

![主界面](docs/screenshot.png)

> 左右分栏布局，Material Design风格，简洁高效

## 项目简介

### 核心功能
- 账号管理：添加、编辑、删除对标账号
- 文章管理：收集、整理、分类文章
- 左右分栏：账号列表 + 文章列表的高效布局
- 快速跳转：点击文章标题直接打开原文
- 搜索筛选：按账号、标题、标签快速搜索
- 数据导出：支持导出为 Excel、JSON、Markdown 格式

### 技术特点
- 采用 PyQt5 构建现代化界面
- 使用 SQLite 进行本地数据存储
- 支持批量操作和数据导入导出
- 响应式布局，支持分栏调整

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.8+ | 开发语言 |
| PyQt5 | 5.15+ | GUI框架 |
| SQLite | 内置 | 数据库 |
| openpyxl | 3.0+ | Excel导出 |
| validators | 0.20+ | URL验证 |
| python-dateutil | 2.8+ | 日期处理 |

## 快速开始

### 📦 方式一：下载可执行文件（推荐）

访问 [Releases 页面](https://github.com/wsir78933-rgb/wechat-desktop-app/releases) 选择下载方式：

**推荐：安装程序版本（setup.exe）**
1. 下载最新版本的 `对标账号管理软件-setup-*.exe`
2. 双击运行安装向导
3. 按照提示完成安装
4. 从开始菜单或桌面快捷方式启动

**便携版本（zip）**
1. 下载最新版本的 `对标账号管理软件-windows.zip`
2. 解压到任意目录
3. 双击 `对标账号管理软件.exe` 运行

#### ⚠️ 杀毒软件误报说明

**如果 Windows Defender 提示病毒警告，这是误报（False Positive），请放心使用。**

<details>
<summary>为什么会误报？如何解决？（点击展开）</summary>

**原因：**
- PyInstaller 使用压缩和自解压技术（与某些恶意软件特征相似）
- 可执行文件未进行代码签名（需要购买证书）
- 包含完整 Python 解释器

**验证安全性：**
1. 查看 [GitHub Actions 构建日志](https://github.com/wsir78933-rgb/wechat-desktop-app/actions) - 所有构建过程透明可审计
2. 检查源代码 - 完全开源，没有恶意代码
3. 上传到 [VirusTotal](https://www.virustotal.com/) 进行多引擎扫描

**解决方法：**
```powershell
# 方法1: 添加到 Windows Defender 白名单
Windows 安全中心 → 病毒和威胁防护 → 排除项 → 添加文件

# 方法2: 下载后右键 → 属性 → 解除阻止
右键 .zip 文件 → 属性 → 勾选"解除阻止" → 应用 → 确定
```

</details>

---

### 💻 方式二：从源代码运行（开发者）

## 安装说明

### 1. 环境要求
- Python 3.8 或更高版本
- Windows 10/11（推荐）

### 2. 克隆项目
```bash
git clone <repository_url>
cd 对标账号管理软件
```

### 3. 创建虚拟环境（推荐）
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### 4. 安装依赖
```bash
pip install -r requirements.txt
```

## 运行方法

### 开发环境运行
```bash
# 普通模式
python src/main/python/main.py

# 调试模式（显示详细日志）
python src/main/python/main.py --debug
```

### 打包为可执行文件（可选）
```bash
# 安装打包工具
pip install PyInstaller

# 打包为单个exe文件
pyinstaller --onefile --windowed src/main/python/main.py
```

## 项目结构

```
对标账号管理软件/
├── src/                    # 源代码
│   ├── main/
│   │   └── python/
│   │       ├── main.py            # 入口文件
│   │       ├── core/              # 核心业务逻辑
│   │       │   ├── database.py    # 数据库操作
│   │       │   ├── account_manager.py  # 账号管理
│   │       │   └── article_manager.py  # 文章管理
│   │       ├── ui/                # 界面组件
│   │       │   ├── main_window.py      # 主窗口
│   │       │   ├── dialogs/            # 对话框
│   │       │   └── widgets/            # 自定义组件
│   │       └── utils/             # 工具函数
│   └── test/              # 测试代码
├── data/                  # 数据文件
│   └── database.db        # SQLite数据库
├── logs/                  # 日志文件
├── docs/                  # 文档
│   ├── 需求文档.md
│   └── 技术文档.md
├── requirements.txt       # 依赖清单
└── README.md             # 项目说明
```

## 使用指南

### 1. 添加账号
1. 点击工具栏的"➕ 添加账号"按钮
2. 填写账号名称（必填）和分类（必填）
3. 可选填写账号描述和头像链接
4. 点击"确定"保存

### 2. 添加文章
1. 点击工具栏的"➕ 添加文章"按钮
2. 选择所属账号（必填）
3. 填写文章标题（必填）和链接（必填）
4. 可选填写发布日期、标签、摘要、封面图
5. 勾选"添加后继续添加"可连续添加多篇
6. 点击"确定"保存

### 3. 浏览文章
1. 在左侧账号列表中点击账号
2. 右侧显示该账号下的所有文章
3. 点击文章标题或"🔗 打开"按钮在浏览器中查看原文
4. 使用搜索框快速查找文章

### 4. 导出数据
1. 点击工具栏的"📤 导出"按钮
2. 选择导出格式（Excel/JSON/Markdown）
3. 选择保存位置
4. 导出完成

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+N | 添加账号 |
| Ctrl+T | 添加文章 |
| Ctrl+E | 导出数据 |
| F5 | 刷新列表 |
| Ctrl+Q | 退出程序 |

## 开发计划

### 已完成功能
- [x] 主窗口框架
- [x] 左右分栏布局
- [x] 基础UI组件

### 待开发功能
- [ ] 数据库操作模块
- [ ] 账号管理器
- [ ] 文章管理器
- [ ] 对话框组件
- [ ] 搜索筛选功能
- [ ] 数据导出功能
- [ ] 批量操作功能

## 常见问题

### Q: 启动后报错"No module named 'PyQt5'"？
A: 请确保已安装 PyQt5：`pip install PyQt5>=5.15.0`

### Q: 数据库文件在哪里？
A: 数据库文件位于项目根目录的 `data/database.db`

### Q: 如何备份数据？
A: 直接复制 `data/database.db` 文件即可备份所有数据

### Q: 支持哪些操作系统？
A: 目前主要支持 Windows 10/11，理论上也支持 Linux 和 macOS

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 更新日志

### v1.0 (2025-01-15)
- 初始版本发布
- 实现主窗口框架
- 实现左右分栏布局
- 创建入口文件和配置文件

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件

---

**开发工具**: Claude Code
**最后更新**: 2025-01-15
