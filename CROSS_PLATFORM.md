# 跨平台兼容性说明

## 🔧 问题背景

### WSL开发环境 → Windows运行环境的挑战

本项目在WSL（Linux）环境中开发，但需要打包为Windows exe运行。这带来以下挑战：

1. **原生模块平台差异**
   - `better-sqlite3` 是C++原生模块
   - Linux环境安装的是Linux版本
   - Windows运行需要Windows编译版本

2. **路径分隔符差异**
   - Linux: `/home/user/path`
   - Windows: `C:\Users\user\path`

3. **依赖构建工具链差异**
   - Linux: gcc, make
   - Windows: MSVC, node-gyp

## ✅ 解决方案

### 1. GitHub Actions Windows环境构建

```yaml
runs-on: windows-latest  # 在Windows环境构建
```

**优势**：
- ✅ 直接在目标平台构建
- ✅ 避免跨平台编译问题
- ✅ 原生模块自动匹配Windows

### 2. 原生模块重新编译配置

**package.json配置**：
```json
{
  "build": {
    "npmRebuild": true,              // 启用重新编译
    "buildDependenciesFromSource": true,  // 从源码构建
    "nodeGypRebuild": true,          // 使用node-gyp重新构建
    "asarUnpack": [
      "node_modules/better-sqlite3/**/*"  // 不打包原生模块到asar
    ]
  }
}
```

**作用**：
- ✅ 在打包时重新编译原生模块
- ✅ 确保使用Windows版本的二进制文件
- ✅ 避免asar打包导致的原生模块加载失败

### 3. GitHub Actions显式重新编译

**工作流配置**：
```yaml
- name: 配置 Python（用于原生模块编译）
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'

- name: 安装依赖
  run: npm ci

- name: 重新编译原生模块（确保Windows兼容）
  if: runner.os == 'Windows'
  run: npm rebuild better-sqlite3 --build-from-source
```

**原理**：
- ✅ Python是node-gyp的依赖
- ✅ `npm ci` 安装依赖（可能包含预编译二进制）
- ✅ `npm rebuild --build-from-source` 强制从源码重新编译

### 4. .gitignore正确配置

```gitignore
node_modules      # 不提交依赖（避免平台冲突）
dist              # 不提交构建产物
```

**重要性**：
- ✅ 每个环境独立安装依赖
- ✅ 避免WSL的Linux版本混入Windows构建

## 🚀 工作流程

### 开发阶段（WSL Linux）

```bash
# 1. 开发和测试
npm install          # 安装Linux版本依赖
npm run dev          # 本地开发

# 2. 提交代码
git add .
git commit -m "新功能"
git push origin master
```

### 构建阶段（GitHub Actions Windows）

```bash
# GitHub Actions自动执行：
1. 检出代码（不包含node_modules）
2. 在Windows环境安装依赖
3. 重新编译better-sqlite3（Windows版本）
4. 构建TypeScript
5. 打包electron（包含Windows原生模块）
6. 上传exe安装程序
```

### 运行阶段（Windows用户）

```
用户下载exe → 安装 → 运行（使用正确的Windows原生模块）
```

## 📋 验证清单

### 确保跨平台兼容的检查项

- [x] `.gitignore` 包含 `node_modules` 和 `dist`
- [x] `package.json` 启用 `npmRebuild`、`buildDependenciesFromSource`
- [x] GitHub Actions 运行在 `windows-latest`
- [x] 工作流包含 Python 环境配置
- [x] 工作流显式重新编译 better-sqlite3
- [x] `asarUnpack` 配置排除原生模块

## ⚠️ 常见错误

### ❌ 错误做法

1. **提交node_modules到Git**
   ```bash
   # 错误：会导致平台冲突
   git add node_modules
   ```

2. **禁用rebuild**
   ```json
   {
     "npmRebuild": false,  // 错误：会使用错误平台的模块
     "buildDependenciesFromSource": false
   }
   ```

3. **在WSL中打包Windows应用**
   ```bash
   # 错误：跨平台打包容易失败
   npm run build:win  # 在WSL中执行
   ```

### ✅ 正确做法

1. **排除node_modules**
   ```gitignore
   node_modules
   ```

2. **启用rebuild**
   ```json
   {
     "npmRebuild": true,
     "buildDependenciesFromSource": true
   }
   ```

3. **在目标平台构建**
   ```yaml
   runs-on: windows-latest  # Windows环境构建Windows应用
   ```

## 🎯 最佳实践

1. **开发环境**：使用任何平台（WSL、macOS、Windows）
2. **提交代码**：只提交源码，不提交依赖和构建产物
3. **CI/CD构建**：在目标平台（Windows）构建
4. **原生模块**：始终在目标平台重新编译

## 📚 相关资源

- [electron-builder原生模块文档](https://www.electron.build/configuration/configuration#Configuration-nativeRebuilding)
- [better-sqlite3平台支持](https://github.com/WiseLibs/better-sqlite3/wiki/Troubleshooting)
- [node-gyp Windows配置](https://github.com/nodejs/node-gyp#on-windows)

---

**结论**：通过正确的配置，可以在WSL环境开发，同时确保在GitHub Actions的Windows环境中正确构建Windows应用，实现完美的跨平台兼容性。
