# Windows打包说明

## 环境要求

- **操作系统**: Windows 10/11
- **Node.js**: v18 或更高版本
- **npm**: v9 或更高版本

## 打包步骤

### 方法一：使用PowerShell脚本（推荐）

1. 在Windows中打开PowerShell
2. 导航到项目目录
3. 运行打包脚本：

```powershell
.\build-windows.ps1
```

### 方法二：手动执行命令

1. 安装依赖：
```bash
npm install
```

2. 构建项目：
```bash
npm run build
```

3. 打包exe：
```bash
npm run build:win
```

## 打包输出

打包完成后，文件将输出到 `dist/` 目录：

- **安装程序**: `dist/公众号桌面应用 Setup 1.0.0.exe`
- **便携版**: `dist/win-unpacked/`

## WSL用户注意事项

由于better-sqlite3是native模块，在WSL中无法直接为Windows交叉编译。

**解决方案**：

1. 在Windows中安装Node.js和npm
2. 在Windows PowerShell中运行打包命令
3. 或使用Windows的VS Code打开WSL项目，在集成终端中运行

## 常见问题

### Q: better-sqlite3编译失败？
A: 确保在Windows环境中运行，而不是WSL。better-sqlite3需要为目标平台编译。

### Q: electron-builder下载失败？
A: 可能是网络问题，可以配置镜像：
```bash
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
```

### Q: 打包后exe无法运行？
A: 检查是否包含了所有依赖，特别是better-sqlite3的原生模块。

## Git推送

打包配置完成后，推送到Git：

```bash
git add -A
git commit -m "添加Windows打包配置"
git push origin master
```

## 自动化打包（可选）

可以配置GitHub Actions或其他CI/CD工具自动打包：

```yaml
# .github/workflows/build.yml
name: Build
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build:win
      - uses: actions/upload-artifact@v3
        with:
          name: windows-installer
          path: dist/*.exe
```
