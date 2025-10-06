# 公众号桌面应用

基于 Electron + React + TypeScript + Vite 的桌面应用程序

## 技术栈

- **Electron**: 跨平台桌面应用框架
- **React 18**: 用户界面库
- **TypeScript**: 类型安全的 JavaScript
- **Vite**: 快速的构建工具
- **Tailwind CSS**: 实用优先的 CSS 框架
- **electron-vite**: Electron 的 Vite 集成
- **better-sqlite3**: SQLite 数据库
- **cheerio**: HTML 解析
- **axios**: HTTP 客户端
- **zustand**: 状态管理

## 项目结构

```
公众号桌面应用/
├── src/
│   ├── main/              # 主进程代码
│   │   └── index.ts
│   ├── preload/           # 预加载脚本
│   │   └── index.ts
│   └── renderer/          # 渲染进程代码
│       ├── index.html
│       └── src/
│           ├── App.tsx
│           ├── main.tsx
│           ├── index.css
│           └── vite-env.d.ts
├── resources/             # 静态资源
├── package.json
├── tsconfig.json
├── electron.vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run typecheck

# 预览构建结果
npm run preview
```

## 开始使用

1. 安装依赖：`npm install`
2. 启动开发服务器：`npm run dev`
3. 开始开发您的应用

## 许可证

MIT
