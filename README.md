# 公众号桌面应用

一个基于Electron的微信公众号文章管理桌面应用，支持文章采集、本地存储、全文搜索和标签管理。

## ✨ 功能特性

- 📝 **文章采集**: 通过URL或拖放链接快速采集微信公众号文章
- 🗂️ **本地管理**: 文章本地存储，支持离线阅读
- 🔍 **全文搜索**: FTS5全文搜索引擎，支持中文
- 🏷️ **标签系统**: 灵活的标签管理和分类
- 💾 **数据导出**: 支持Markdown、HTML、PDF、JSON格式导出
- 🪟 **悬浮窗**: 独立悬浮窗，方便快速采集
- ⌨️ **快捷键**: Ctrl+Shift+A 快速显示/隐藏悬浮窗

## 🖥️ 系统要求

- Windows 10/11 (x64)
- 4GB RAM
- 500MB 磁盘空间

## 📥 下载安装

### 方式一：从GitHub Release下载（推荐）

1. 访问 [Releases](../../releases) 页面
2. 下载最新版本的 `公众号桌面应用 Setup x.x.x.exe`
3. 运行安装程序，按提示完成安装

### 方式二：从GitHub Actions构建

1. 访问 [Actions](../../actions) 页面
2. 选择最新成功的workflow运行
3. 下载 `公众号桌面应用-Windows-Setup` 构件
4. 解压并运行安装程序

## 🚀 快速开始

### 开发环境

```bash
# 克隆仓库
git clone <repository-url>
cd 公众号桌面应用

# 安装依赖
npm install

# 启动开发模式
npm run dev

# 类型检查
npm run typecheck

# 构建项目
npm run build
```

### 打包发布

#### 自动打包（推荐）

推送代码到GitHub，Actions会自动构建：

```bash
# Windows环境使用PowerShell
.\git-push.ps1

# 或使用Git命令
git add -A
git commit -m "你的提交信息"
git push origin master
```

#### 本地打包

在Windows环境运行：

```powershell
# 使用PowerShell脚本
.\build-windows.ps1

# 或手动执行
npm run build:win
```

详细说明见 [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md)

## 📖 文档

- [技术文档](dosc/技术文档.md) - 完整技术架构
- [UI设计](dosc/UI界面设计_中文版.txt) - 界面设计规范
- [IPC通信](dosc/IPC通信架构文档.md) - 进程间通信架构
- [打包说明](BUILD_INSTRUCTIONS.md) - Windows打包指南
- [发布流程](RELEASE_GUIDE.md) - 版本发布流程
- [开发总结](DEVELOPMENT_SUMMARY.md) - 项目开发总结

## 🛠️ 技术栈

### 核心框架
- **Electron** v28 - 跨平台桌面应用框架
- **React** v18 - UI框架
- **TypeScript** v5 - 类型安全
- **Vite** v5 - 构建工具

### 数据库
- **Better-SQLite3** - SQLite数据库（支持FTS5全文搜索）

### UI组件
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理
- **React Markdown** - Markdown渲染

### 其他工具
- **Cheerio** - HTML解析（文章抓取）
- **Axios** - HTTP客户端
- **Electron Store** - 配置持久化
- **Electron Builder** - 应用打包

## 📂 项目结构

```
公众号桌面应用/
├── src/
│   ├── main/              # 主进程（Electron）
│   │   ├── database/      # 数据库模块
│   │   ├── windows/       # 窗口管理
│   │   ├── ipc/           # IPC处理器
│   │   ├── scrapers/      # 文章抓取
│   │   └── config/        # 配置管理
│   ├── preload/           # Preload脚本
│   ├── renderer/          # 渲染进程（React）
│   │   ├── src/
│   │   │   ├── components/ # UI组件
│   │   │   ├── store/      # 状态管理
│   │   │   ├── utils/      # 工具函数
│   │   │   └── styles/     # 样式文件
│   │   ├── index.html     # 主窗口
│   │   └── float.html     # 悬浮窗
│   └── types/             # TypeScript类型定义
├── .github/
│   └── workflows/         # GitHub Actions配置
├── build/                 # 构建资源
├── dosc/                  # 项目文档
├── out/                   # 构建输出
└── dist/                  # 打包输出
```

## 🔧 开发脚本

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建项目
npm run typecheck    # TypeScript类型检查
npm run build:win    # 打包Windows安装程序
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

---

## 🚀 发布流程

### 1. 推送代码（自动构建）

```bash
.\git-push.ps1
```

### 2. 创建正式版本

```bash
# 更新版本号
npm version patch  # 或 minor, major

# 推送tag触发Release
git push --tags
```

### 3. 下载构建产物

访问 [Actions](../../actions) 或 [Releases](../../releases) 下载安装程序

---

**开发完成**: 2025-10-06
**版本**: v1.0.0
**作者**: Your Name

🤖 Powered by [Claude Code](https://claude.com/claude-code)
