# Git推送设置指南

## 当前状态

✅ 项目已完成开发和构建配置
✅ GitHub Actions工作流已配置
✅ 所有代码已提交到本地Git仓库
⏳ **待完成**: 推送到GitHub远程仓库

## 🚀 推送步骤

### 方式一：如果已有GitHub仓库

在WSL终端运行：

```bash
cd "/home/wcp/项目集合/公众号桌面应用"

# 添加远程仓库（替换为你的仓库URL）
git remote add origin https://github.com/你的用户名/仓库名.git

# 推送代码
git push -u origin master
```

### 方式二：创建新的GitHub仓库

1. **访问GitHub创建仓库**
   - 登录 https://github.com
   - 点击右上角 "+" -> "New repository"
   - 仓库名：`wechat-desktop-app` 或自定义
   - 描述：公众号桌面应用
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize with README"（我们已经有了）
   - 点击 "Create repository"

2. **复制仓库URL**
   - 创建后会显示仓库URL，例如：
     `https://github.com/wsir78933-rgb/wechat-desktop-app.git`

3. **在WSL中推送**
   ```bash
   cd "/home/wcp/项目集合/公众号桌面应用"

   # 添加远程仓库
   git remote add origin https://github.com/wsir78933-rgb/仓库名.git

   # 推送所有代码
   git push -u origin master
   ```

### 方式三：使用GitHub CLI（推荐）

```bash
# 安装GitHub CLI（如果未安装）
# WSL Ubuntu:
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# 认证
gh auth login

# 创建仓库并推送
cd "/home/wcp/项目集合/公众号桌面应用"
gh repo create wechat-desktop-app --public --source=. --remote=origin --push
```

## 🔐 认证问题

### 如果推送时要求密码

GitHub已不支持密码认证，需要使用：

1. **Personal Access Token（推荐）**
   - 访问 https://github.com/settings/tokens
   - Generate new token (classic)
   - 勾选 `repo` 权限
   - 生成并复制token
   - 推送时用token替代密码

2. **SSH密钥**
   ```bash
   # 生成SSH密钥
   ssh-keygen -t ed25519 -C "wsir78933-rgb@example.com"

   # 添加到GitHub
   cat ~/.ssh/id_ed25519.pub
   # 复制输出，添加到 https://github.com/settings/keys

   # 使用SSH URL
   git remote set-url origin git@github.com:用户名/仓库名.git
   ```

3. **GitHub CLI认证（最简单）**
   ```bash
   gh auth login
   # 按提示选择认证方式
   ```

## ✅ 推送成功后

推送成功后，GitHub Actions会自动：
1. ✅ 检出代码
2. ✅ 安装依赖
3. ✅ 运行TypeScript类型检查
4. ✅ 构建项目
5. ✅ 打包Windows exe安装程序
6. ✅ 上传构建产物到Artifacts

### 下载构建的exe

1. 访问你的仓库
2. 点击 **Actions** 标签
3. 选择最新的 "Build and Release" workflow
4. 等待构建完成（约3-5分钟）
5. 在页面底部 **Artifacts** 区域下载：
   - `公众号桌面应用-Windows-Setup` - 安装程序
   - `公众号桌面应用-Windows-Portable` - 便携版

## 🏷️ 创建Release版本（可选）

如果要创建正式发布版本：

```bash
cd "/home/wcp/项目集合/公众号桌面应用"

# 创建版本tag
git tag -a v1.0.0 -m "首次发布"

# 推送tag
git push origin v1.0.0
```

推送tag后，GitHub Actions会：
- 自动构建exe
- 创建GitHub Release
- 上传安装程序到Release页面

## 📋 当前提交历史

```
7d20eff - 添加Windows便捷脚本和使用说明
e9f0860 - 完善项目文档和Git推送脚本
6ed3ed7 - 添加Windows打包配置和GitHub Actions自动构建
5d7321c - 集成所有模块并完成测试
[更多提交...]
```

## 🆘 需要帮助？

如果遇到问题，可以：
1. 检查GitHub Actions日志排查错误
2. 查看 [RELEASE_GUIDE.md](RELEASE_GUIDE.md) 详细说明
3. 确保网络可以访问GitHub

---

**下一步操作**: 根据上述方式选择一个，推送代码到GitHub！
