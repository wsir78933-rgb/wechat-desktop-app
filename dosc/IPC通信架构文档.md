# IPC通信架构文档

## 架构概览

本项目采用 Electron 推荐的安全IPC通信架构，通过 `contextBridge` 和 `ipcMain`/`ipcRenderer` 实现主进程与渲染进程之间的安全通信。

```
┌─────────────────────────────────────────────────────────────┐
│                        渲染进程                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React组件                                            │  │
│  │  - 调用 window.api.xxx()                             │  │
│  │  - 类型安全的API调用                                  │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Preload脚本 (src/preload/index.ts)                  │  │
│  │  - contextBridge.exposeInMainWorld()                 │  │
│  │  - 白名单验证                                         │  │
│  │  - API安全包装                                        │  │
│  └──────────────────┬───────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────┘
                     │ IPC Channel
                     │ (安全隔离)
┌────────────────────┼────────────────────────────────────────┐
│                    ▼                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  IPC处理器 (src/main/ipc/)                           │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  article.ts  - 文章采集、CRUD、导出            │  │  │
│  │  │  tag.ts      - 标签管理、关联操作              │  │  │
│  │  │  search.ts   - 搜索、统计                      │  │  │
│  │  │  system.ts   - 系统路径、外部链接              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  业务服务层 (待实现)                                  │  │
│  │  - Database (SQLite)                                 │  │
│  │  - Scraper (爬虫引擎)                                │  │
│  │  - Exporter (导出服务)                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                        主进程                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 目录结构

```
src/
├── types/
│   └── ipc.ts                    # IPC类型定义 (共享)
├── main/
│   ├── index.ts                  # 主进程入口
│   └── ipc/
│       ├── index.ts              # IPC处理器统一注册
│       ├── article.ts            # 文章相关IPC处理器
│       ├── tag.ts                # 标签相关IPC处理器
│       ├── search.ts             # 搜索相关IPC处理器
│       └── system.ts             # 系统相关IPC处理器
├── preload/
│   └── index.ts                  # Preload脚本 (安全桥接)
└── renderer/
    └── src/
        └── examples/
            └── ipc-usage-example.tsx  # 使用示例
```

---

## 核心模块详解

### 1. 类型定义 (`src/types/ipc.ts`)

定义了所有IPC通信的类型和通道常量。

#### 关键类型

```typescript
// 文章类型
interface Article {
  id?: number;
  title: string;
  author: string;
  publishDate: string;
  content: string;
  url: string;
  tags: string[];
  // ... 更多字段
}

// IPC通道常量
const IPC_CHANNELS = {
  ARTICLE_SCRAPE: 'article:scrape',
  ARTICLE_GET_ALL: 'article:getAll',
  // ... 更多通道
} as const;

// 渲染进程API接口
interface IpcApi {
  scrapeArticles: (params: ScrapeParams) => Promise<ScrapeResult>;
  getAllArticles: (limit?: number, offset?: number) => Promise<Article[]>;
  // ... 更多方法
}
```

**特点：**
- 类型安全：所有IPC调用都有完整的TypeScript类型
- 单一真相源：所有类型定义集中管理
- 通道白名单：通过常量定义允许的IPC通道

---

### 2. Preload脚本 (`src/preload/index.ts`)

Electron安全架构的核心，使用 `contextBridge` 暴露安全的API。

#### 安全机制

```typescript
// 1. 白名单验证
const ALLOWED_CHANNELS = Object.values(IPC_CHANNELS);

function isValidChannel(channel: string): boolean {
  return ALLOWED_CHANNELS.includes(channel);
}

// 2. 安全包装
function safeInvoke<T>(channel: string, ...args: any[]): Promise<T> {
  if (!isValidChannel(channel)) {
    return Promise.reject(new Error(`未授权的IPC通道: ${channel}`));
  }
  return ipcRenderer.invoke(channel, ...args);
}

// 3. 暴露安全API
contextBridge.exposeInMainWorld('api', {
  getAllArticles: (limit, offset) =>
    safeInvoke(IPC_CHANNELS.ARTICLE_GET_ALL, limit, offset),
  // ... 更多API
});
```

**安全特性：**
- ✅ 上下文隔离 (`contextIsolation: true`)
- ✅ 沙箱模式 (`sandbox: true`)
- ✅ 白名单验证 (只允许预定义的通道)
- ✅ 类型安全 (完整的TypeScript类型)
- ✅ 防止注入 (无法直接访问Node.js API)

---

### 3. IPC处理器 (`src/main/ipc/`)

#### 3.1 文章处理器 (`article.ts`)

处理文章相关的所有操作。

```typescript
// 文章采集
ipcMain.handle(IPC_CHANNELS.ARTICLE_SCRAPE, async (_event, params: ScrapeParams) => {
  const scraper = new WechatScraper();
  const articles = await scraper.scrape(params);
  return { success: true, articles, total: articles.length };
});

// 获取文章列表
ipcMain.handle(IPC_CHANNELS.ARTICLE_GET_ALL, async (_event, limit, offset) => {
  const db = new ArticleDatabase();
  return await db.getAll(limit, offset);
});
```

**功能清单：**
- 文章采集 (支持进度回调)
- 文章列表查询 (分页)
- 文章详情获取
- 文章删除
- 文章更新
- 文章导出 (Markdown/HTML/PDF/JSON)

#### 3.2 标签处理器 (`tag.ts`)

```typescript
// 创建标签 (带验证)
ipcMain.handle(IPC_CHANNELS.TAG_CREATE, async (_event, name, color) => {
  if (!name || name.trim().length === 0) {
    return { success: false, message: '标签名称不能为空' };
  }

  const db = new TagDatabase();
  const tag = await db.create(name, color);
  return { success: true, tag };
});
```

**功能清单：**
- 标签CRUD (增删改查)
- 输入验证 (名称长度、重复性)
- 文章-标签关联管理
- 标签统计 (文章数量)

#### 3.3 搜索处理器 (`search.ts`)

```typescript
// 搜索文章
ipcMain.handle(IPC_CHANNELS.SEARCH_ARTICLES, async (_event, params: SearchParams) => {
  const searchService = new SearchService();
  const result = await searchService.search(params);
  return {
    articles: result.articles,
    total: result.total,
    hasMore: result.hasMore,
  };
});
```

**功能清单：**
- 关键词搜索
- 多条件过滤 (标签、作者、日期)
- 搜索建议 (自动补全)
- 统计数据 (文章数、标签数、热门标签/作者)

#### 3.4 系统处理器 (`system.ts`)

```typescript
// 获取系统路径
ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_PATH, async (_event, name) => {
  return app.getPath(name); // 'home', 'documents', etc.
});

// 打开外部链接 (带安全验证)
ipcMain.handle(IPC_CHANNELS.SYSTEM_OPEN_EXTERNAL, async (_event, url) => {
  if (!url.startsWith('https://')) {
    throw new Error('只允许HTTPS链接');
  }
  await shell.openExternal(url);
});
```

**安全特性：**
- URL格式验证
- 协议白名单 (只允许https)
- 防止本地文件访问 (`file://`)

---

### 4. 主进程入口 (`src/main/index.ts`)

```typescript
import { registerAllIpcHandlers, unregisterAllIpcHandlers } from './ipc';

app.whenReady().then(() => {
  // 注册所有IPC处理器
  registerAllIpcHandlers();

  // 创建窗口
  createWindow();
});

app.on('before-quit', () => {
  // 清理IPC处理器
  unregisterAllIpcHandlers();
});
```

**特性：**
- 统一注册/清理IPC处理器
- 错误处理 (uncaughtException, unhandledRejection)
- 开发/生产环境自动切换
- 窗口安全配置

---

## 使用示例

### 渲染进程中调用API

```typescript
import React, { useState, useEffect } from 'react';

function ArticleList() {
  const [articles, setArticles] = useState([]);

  // 加载文章列表
  const loadArticles = async () => {
    try {
      const data = await window.api.getAllArticles(20, 0);
      setArticles(data);
    } catch (error) {
      console.error('加载失败:', error);
    }
  };

  // 删除文章
  const deleteArticle = async (id: number) => {
    const success = await window.api.deleteArticle(id);
    if (success) {
      setArticles(prev => prev.filter(a => a.id !== id));
    }
  };

  // 搜索文章
  const searchArticles = async (keyword: string) => {
    const result = await window.api.searchArticles({
      keyword,
      limit: 20
    });
    setArticles(result.articles);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // ... JSX渲染
}
```

### 监听进度事件

```typescript
function ArticleScraper() {
  useEffect(() => {
    // 注册采集进度监听
    window.api.onScrapeProgress((progress) => {
      console.log(`进度: ${progress.current}/${progress.total}`);
      console.log(`当前: ${progress.currentArticle}`);
    });
  }, []);

  const startScrape = async () => {
    const result = await window.api.scrapeArticles({
      url: 'https://mp.weixin.qq.com/...',
      accountName: '公众号名称',
      maxArticles: 50,
    });

    if (result.success) {
      console.log(`采集成功，共 ${result.total} 篇`);
    }
  };

  // ... JSX
}
```

---

## IPC通道清单

### 文章相关

| 通道名称 | 参数 | 返回值 | 说明 |
|---------|------|--------|------|
| `article:scrape` | `ScrapeParams` | `ScrapeResult` | 采集文章 |
| `article:getAll` | `limit, offset` | `Article[]` | 获取文章列表 |
| `article:getById` | `id` | `Article \| null` | 获取文章详情 |
| `article:delete` | `id` | `boolean` | 删除文章 |
| `article:update` | `id, article` | `boolean` | 更新文章 |
| `article:export` | `ExportParams` | `ExportResult` | 导出文章 |
| `article:scrape:progress` | - | `ScrapeProgress` | 采集进度(事件) |

### 标签相关

| 通道名称 | 参数 | 返回值 | 说明 |
|---------|------|--------|------|
| `tag:getAll` | - | `Tag[]` | 获取所有标签 |
| `tag:create` | `name, color?` | `TagOperationResult` | 创建标签 |
| `tag:update` | `id, name, color?` | `TagOperationResult` | 更新标签 |
| `tag:delete` | `id` | `boolean` | 删除标签 |
| `tag:addToArticle` | `articleId, tagId` | `boolean` | 为文章添加标签 |
| `tag:removeFromArticle` | `articleId, tagId` | `boolean` | 移除文章标签 |

### 搜索相关

| 通道名称 | 参数 | 返回值 | 说明 |
|---------|------|--------|------|
| `search:articles` | `SearchParams` | `SearchResult` | 搜索文章 |
| `search:suggestions` | `keyword` | `string[]` | 搜索建议 |
| `stats:get` | - | `Statistics` | 获取统计数据 |

### 系统相关

| 通道名称 | 参数 | 返回值 | 说明 |
|---------|------|--------|------|
| `system:getPath` | `name` | `string` | 获取系统路径 |
| `system:openExternal` | `url` | `void` | 打开外部链接 |

---

## 安全最佳实践

### ✅ 已实现的安全措施

1. **上下文隔离**
   ```typescript
   webPreferences: {
     nodeIntegration: false,
     contextIsolation: true,
     sandbox: true,
   }
   ```

2. **通道白名单**
   ```typescript
   const ALLOWED_CHANNELS = Object.values(IPC_CHANNELS);
   if (!ALLOWED_CHANNELS.includes(channel)) {
     throw new Error('未授权的通道');
   }
   ```

3. **输入验证**
   ```typescript
   if (!name || name.trim().length === 0) {
     return { success: false, message: '输入无效' };
   }
   ```

4. **URL安全**
   ```typescript
   if (url.startsWith('file://')) {
     throw new Error('不允许file协议');
   }
   ```

### 🔒 推荐的额外措施

1. **参数类型验证**
   ```typescript
   function validateScrapeParams(params: any): params is ScrapeParams {
     return typeof params.url === 'string' &&
            typeof params.accountName === 'string';
   }
   ```

2. **速率限制**
   ```typescript
   const rateLimiter = new Map();

   function checkRateLimit(channel: string): boolean {
     const lastCall = rateLimiter.get(channel);
     const now = Date.now();

     if (lastCall && now - lastCall < 1000) {
       return false; // 1秒内只能调用一次
     }

     rateLimiter.set(channel, now);
     return true;
   }
   ```

3. **权限控制**
   ```typescript
   function requirePermission(channel: string, permission: string) {
     if (!hasPermission(permission)) {
       throw new Error(`需要权限: ${permission}`);
     }
   }
   ```

---

## 扩展开发指南

### 添加新的IPC功能

1. **定义类型** (`src/types/ipc.ts`)
   ```typescript
   export interface NewFeatureParams {
     param1: string;
     param2: number;
   }

   export const IPC_CHANNELS = {
     // ...
     NEW_FEATURE: 'newFeature:action',
   } as const;

   export interface IpcApi {
     // ...
     newFeature: (params: NewFeatureParams) => Promise<Result>;
   }
   ```

2. **创建处理器** (`src/main/ipc/new-feature.ts`)
   ```typescript
   export function registerNewFeatureHandlers() {
     ipcMain.handle(IPC_CHANNELS.NEW_FEATURE, async (_event, params) => {
       // 业务逻辑
       return result;
     });
   }
   ```

3. **注册处理器** (`src/main/ipc/index.ts`)
   ```typescript
   import { registerNewFeatureHandlers } from './new-feature';

   export function registerAllIpcHandlers() {
     // ...
     registerNewFeatureHandlers();
   }
   ```

4. **暴露API** (`src/preload/index.ts`)
   ```typescript
   const api: IpcApi = {
     // ...
     newFeature: (params) =>
       safeInvoke(IPC_CHANNELS.NEW_FEATURE, params),
   };
   ```

5. **使用API** (渲染进程)
   ```typescript
   const result = await window.api.newFeature({
     param1: 'value',
     param2: 123
   });
   ```

---

## 调试技巧

### 1. 开发模式日志

Preload和IPC处理器都有详细的日志：

```
[Preload] 调用: getAllArticles { limit: 20, offset: 0 }
[IPC] 获取文章列表: limit=20, offset=0
[Main] 窗口准备完成，显示窗口
```

### 2. DevTools调试

```typescript
// 在渲染进程中
console.log('调用API前:', params);
const result = await window.api.someMethod(params);
console.log('API返回:', result);
```

### 3. 主进程调试

```bash
# 启用详细日志
export ELECTRON_ENABLE_LOGGING=1
npm run dev
```

---

## 性能优化

1. **批量操作**
   ```typescript
   // ❌ 不推荐：多次IPC调用
   for (const id of ids) {
     await window.api.deleteArticle(id);
   }

   // ✅ 推荐：批量IPC调用
   await window.api.batchDeleteArticles(ids);
   ```

2. **数据缓存**
   ```typescript
   // 渲染进程缓存
   const cache = new Map();

   async function getArticle(id: number) {
     if (cache.has(id)) {
       return cache.get(id);
     }

     const article = await window.api.getArticleById(id);
     cache.set(id, article);
     return article;
   }
   ```

3. **分页加载**
   ```typescript
   // 虚拟滚动 + 分页
   const ITEMS_PER_PAGE = 50;
   let currentPage = 0;

   async function loadMore() {
     const articles = await window.api.getAllArticles(
       ITEMS_PER_PAGE,
       currentPage * ITEMS_PER_PAGE
     );
     currentPage++;
     return articles;
   }
   ```

---

## 常见问题

### Q: 渲染进程报错 `window.api is undefined`

**A:** 检查以下几点：
1. Preload脚本路径是否正确
2. `contextIsolation: true` 是否开启
3. Preload中是否成功调用 `contextBridge.exposeInMainWorld`

### Q: IPC调用超时

**A:** 可能原因：
1. 主进程处理器未注册
2. 通道名称不匹配
3. 处理器内部抛出异常 (检查主进程日志)

### Q: 如何传递大量数据？

**A:** 对于大文件或大量数据：
1. 不要直接通过IPC传递
2. 使用文件路径传递
3. 主进程写文件，渲染进程读取

```typescript
// 主进程
const filePath = path.join(app.getPath('temp'), 'export.json');
fs.writeFileSync(filePath, JSON.stringify(data));
return { filePath };

// 渲染进程
const { filePath } = await window.api.exportData();
const response = await fetch(`file://${filePath}`);
const data = await response.json();
```

---

## 总结

本IPC通信架构提供了：

✅ **类型安全**：完整的TypeScript类型定义
✅ **安全隔离**：contextBridge + 白名单验证
✅ **模块化**：按功能拆分IPC处理器
✅ **可扩展**：清晰的扩展流程
✅ **易调试**：完善的日志系统
✅ **高性能**：支持批量操作和缓存

**下一步工作：**
1. 实现数据库模块 (`src/main/database/`)
2. 实现爬虫模块 (`src/main/scrapers/`)
3. 实现导出服务 (`src/main/services/exporter`)
4. 添加单元测试和集成测试
