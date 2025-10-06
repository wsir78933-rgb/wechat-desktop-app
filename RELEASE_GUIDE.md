# 发布指南

## GitHub Actions 自动打包

本项目已配置GitHub Actions自动打包，每次推送到master/main分支或创建tag时会自动构建Windows安装程序。

## 发布流程

### 1. 开发完成后提交代码

```bash
git add -A
git commit -m "你的提交信息"
```

### 2. 推送到GitHub

```bash
git push origin master
```

推送后，GitHub Actions会自动：
- ✅ 检出代码
- ✅ 安装依赖
- ✅ 运行类型检查
- ✅ 构建项目
- ✅ 打包Windows exe
- ✅ 上传构件到Actions

### 3. 下载构建产物

1. 访问GitHub仓库
2. 点击 **Actions** 标签
3. 选择最新的workflow运行
4. 在 **Artifacts** 部分下载：
   - `公众号桌面应用-Windows-Setup` - 安装程序
   - `公众号桌面应用-Windows-Portable` - 便携版

### 4. 创建正式版本（可选）

如果要创建正式发布版本：

```bash
# 更新版本号（可选）
npm version patch  # 1.0.0 -> 1.0.1
# 或
npm version minor  # 1.0.0 -> 1.1.0
# 或
npm version major  # 1.0.0 -> 2.0.0

# 创建tag并推送
git push origin master --tags
```

推送tag后，GitHub Actions会：
- ✅ 自动构建
- ✅ 创建GitHub Release
- ✅ 上传安装程序到Release

## 构建产物

### 安装程序
- **文件名**: `公众号桌面应用 Setup 1.0.0.exe`
- **类型**: NSIS安装程序
- **功能**:
  - ✅ 可选择安装路径
  - ✅ 创建桌面快捷方式
  - ✅ 创建开始菜单快捷方式
  - ✅ 完整卸载支持

### 便携版
- **位置**: `win-unpacked/`
- **类型**: 免安装版本
- **使用**: 直接运行 `公众号桌面应用.exe`

## 本地打包（Windows）

如果需要在本地Windows环境打包：

```bash
# 使用PowerShell脚本
.\build-windows.ps1

# 或手动执行
npm run build:win
```

## 配置说明

### package.json 配置

```json
{
  "build": {
    "appId": "com.wechat.desktop.app",
    "productName": "公众号桌面应用",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": ["nsis"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### GitHub Actions 配置

- **触发条件**:
  - 推送到 master/main 分支
  - 推送 tag (v*)
  - Pull Request

- **运行环境**: Windows Latest

- **构建步骤**:
  1. 检出代码
  2. 设置Node.js 18
  3. 安装依赖 (npm ci)
  4. 类型检查
  5. 构建项目
  6. 打包exe
  7. 上传构件

## 故障排除

### Q: Actions构建失败？
**A**: 检查Actions日志，常见问题：
- Node.js版本不匹配
- 依赖安装失败
- TypeScript类型错误（已设置为警告）

### Q: 无法下载构件？
**A**: 确保：
- Actions workflow已成功完成
- 有仓库访问权限
- 构件在90天保留期内

### Q: Release未自动创建？
**A**: 确保：
- 推送的是tag（格式：v1.0.0）
- GITHUB_TOKEN有权限
- workflow文件配置正确

## 版本管理

推荐使用语义化版本：

- **MAJOR**: 不兼容的API修改
- **MINOR**: 向下兼容的功能新增
- **PATCH**: 向下兼容的问题修正

```bash
# 示例
v1.0.0 -> 初始版本
v1.0.1 -> Bug修复
v1.1.0 -> 新功能
v2.0.0 -> 重大更新
```

## 快速命令

```bash
# 提交并推送（自动构建）
git add -A && git commit -m "你的提交" && git push

# 发布新版本
npm version patch && git push --tags

# 查看最新构建
gh run list --limit 5

# 下载最新构件
gh run download
```

## 手动发布流程

如果GitHub Actions不可用，使用本地打包：

1. 在Windows环境运行 `.\build-windows.ps1`
2. 从 `dist/` 目录获取安装程序
3. 手动创建GitHub Release
4. 上传exe文件

---

**注意**: 首次推送后，GitHub Actions会自动运行，无需额外配置！
