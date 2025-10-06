# Windows用户使用说明

## 📋 文件说明

项目根目录提供了以下Windows便捷脚本：

### 1. 推送到GitHub.bat
双击运行，自动推送代码到GitHub并触发自动构建

**功能**:
- ✅ 检查Git环境
- ✅ 配置远程仓库（如果未配置）
- ✅ 提交代码更改
- ✅ 推送到GitHub
- ✅ 显示Actions构建链接

### 2. 打包Windows应用.bat
双击运行，在本地Windows环境打包exe安装程序

**功能**:
- ✅ 检查Node.js和npm
- ✅ 安装依赖
- ✅ TypeScript类型检查
- ✅ 构建项目
- ✅ 打包Windows安装程序

## 🚀 快速开始

### 方式一：自动打包（推荐）

1. **双击运行** `推送到GitHub.bat`
2. 按提示输入GitHub仓库URL（首次）
3. 等待推送完成
4. 访问显示的GitHub Actions链接
5. 下载构建好的exe安装程序

### 方式二：本地打包

1. **双击运行** `打包Windows应用.bat`
2. 等待打包完成
3. 从 `dist/` 目录获取安装程序

## 📥 GitHub仓库配置

### 首次推送需要配置远程仓库

1. 在GitHub创建新仓库
2. 复制仓库URL（例如：https://github.com/username/repo.git）
3. 运行 `推送到GitHub.bat`
4. 粘贴仓库URL

### 如果已有远程仓库

运行 `推送到GitHub.bat` 会自动识别并使用现有配置

## 🔑 GitHub认证

### 使用GitHub CLI（推荐）

```bash
# 安装GitHub CLI
winget install --id GitHub.cli

# 认证
gh auth login
```

### 使用Git Credential Manager

Git for Windows自带凭据管理器，首次推送时会弹出登录窗口

## 📦 构建产物

### GitHub Actions构建
- **位置**: GitHub Actions -> Artifacts
- **文件**: `公众号桌面应用-Windows-Setup.zip`
- **内容**:
  - `公众号桌面应用 Setup 1.0.0.exe` - 安装程序
  - `*.exe.blockmap` - 更新校验文件

### 本地构建
- **位置**: `dist/` 目录
- **文件**:
  - `公众号桌面应用 Setup 1.0.0.exe` - 安装程序
  - `win-unpacked/` - 便携版

## ❓ 常见问题

### Q: 提示"无法运行PowerShell脚本"？
**A**: 需要允许PowerShell脚本执行：
```powershell
# 以管理员运行PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: 推送失败，提示"permission denied"？
**A**:
1. 检查GitHub认证：`gh auth status`
2. 重新登录：`gh auth login`
3. 或使用HTTPS + Personal Access Token

### Q: 打包失败，提示"better-sqlite3错误"？
**A**: 确保在Windows环境运行，不要在WSL中打包

### Q: GitHub Actions构建失败？
**A**:
1. 检查 `.github/workflows/build.yml` 配置
2. 查看Actions日志排查错误
3. 确保package.json版本号正确

## 🎯 发布正式版本

### 创建Release版本

1. 更新版本号：
```bash
npm version patch  # 1.0.0 -> 1.0.1
# 或
npm version minor  # 1.0.0 -> 1.1.0
# 或
npm version major  # 1.0.0 -> 2.0.0
```

2. 推送tag：
```bash
git push --tags
```

3. GitHub Actions会自动：
   - 构建exe
   - 创建GitHub Release
   - 上传安装程序

## 📱 分享安装程序

### 方式一：GitHub Release（推荐）
- 访问 `https://github.com/用户名/仓库名/releases`
- 下载最新版本的exe
- 分享Release链接

### 方式二：直接分享文件
- 从 `dist/` 或 Actions Artifacts 获取exe
- 通过网盘或其他方式分享

## 🔄 更新应用

### 用户端更新
1. 下载最新版本exe
2. 运行安装程序
3. 选择"覆盖安装"

### 开发端更新
1. 修改代码
2. 运行 `推送到GitHub.bat`
3. GitHub自动构建新版本

## 📝 命令行备用方案

如果bat文件无法运行，可手动执行：

### 推送代码
```bash
git add -A
git commit -m "你的提交信息"
git push origin master
```

### 本地打包
```bash
npm install
npm run build
npm run build:win
```

## 🆘 获取帮助

- 查看详细文档：[README.md](README.md)
- 打包问题：[BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md)
- 发布问题：[RELEASE_GUIDE.md](RELEASE_GUIDE.md)

---

**提示**: 所有bat文件都可以直接双击运行，无需打开命令行！
