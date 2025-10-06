# IPC通信模块快速开始

## 已创建的文件清单

### 核心模块

```
src/
├── types/
│   └── ipc.ts                           ✅ IPC类型定义 (共享)
│
├── main/
│   ├── index.ts                         ✅ 主进程入口 (已更新)
│   └── ipc/
│       ├── index.ts                     ✅ IPC统一注册器
│       ├── article.ts                   ✅ 文章处理器
│       ├── tag.ts                       ✅ 标签处理器
│       ├── search.ts                    ✅ 搜索处理器
│       └── system.ts                    ✅ 系统处理器
│
├── preload/
│   └── index.ts                         ✅ 安全API桥接 (已更新)
│
└── renderer/src/examples/
    └── ipc-usage-example.tsx            ✅ 使用示例组件
```

### 文档

```
dosc/
├── IPC通信架构文档.md                    ✅ 完整架构说明
└── IPC-README.md                        ✅ 快速开始指南
```

---

## 快速测试

### 1. 类型检查

```bash
npm run typecheck
```

如果提示类型错误，可能需要在 `src/renderer/src/vite-env.d.ts` 添加：

```typescript
/// <reference types="vite/client" />

declare global {
  interface Window {
    api: import('../../types/ipc').IpcApi;
  }
}

export {};
```

### 2. 启动开发服务器

```bash
npm run dev
```

应该能看到以下日志：

```
[Main] 应用准备完成
[Main] Electron版本: 28.x.x
[IPC] 开始注册所有IPC处理器...
[IPC] 文章处理器注册完成
[IPC] 标签处理器注册完成
[IPC] 搜索处理器注册完成
[IPC] 系统处理器注册完成
[IPC] ✅ 所有IPC处理器注册完成
[Main] 创建主窗口...
[Preload] ✅ API成功暴露到渲染进程
```

### 3. 在渲染进程测试

打开浏览器控制台 (F12)，输入：

```javascript
// 测试文章API
window.api.getAllArticles(5, 0)
  .then(articles => console.log('文章列表:', articles));

// 测试标签API
window.api.getAllTags()
  .then(tags => console.log('标签列表:', tags));

// 测试搜索API
window.api.searchArticles({ keyword: 'test', limit: 10 })
  .then(result => console.log('搜索结果:', result));

// 测试统计API
window.api.getStatistics()
  .then(stats => console.log('统计数据:', stats));

// 测试系统API
window.api.getSystemPath('documents')
  .then(path => console.log('文档路径:', path));
```

---

## 集成到你的React组件

### 方式1：直接使用示例组件

将 `src/renderer/src/examples/ipc-usage-example.tsx` 中的组件导入到你的应用：

```typescript
// src/renderer/src/App.tsx
import { ArticleListExample, SearchExample } from './examples/ipc-usage-example';

export default function App() {
  return (
    <div className="app">
      <ArticleListExample />
      <SearchExample />
    </div>
  );
}
```

### 方式2：创建自己的组件

```typescript
// src/renderer/src/components/ArticleManager.tsx
import React, { useState, useEffect } from 'react';
import type { Article } from '../../../types/ipc';

export function ArticleManager() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    // 加载文章列表
    window.api.getAllArticles(50, 0)
      .then(data => setArticles(data))
      .catch(error => console.error('加载失败:', error));
  }, []);

  return (
    <div>
      <h1>文章管理</h1>
      {articles.map(article => (
        <div key={article.id}>
          <h3>{article.title}</h3>
          <p>{article.author}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## API快速参考

### 文章相关

```typescript
// 采集文章
window.api.scrapeArticles({
  url: 'https://mp.weixin.qq.com/...',
  accountName: '公众号名称',
  maxArticles: 50
});

// 获取文章列表 (分页)
window.api.getAllArticles(limit, offset);

// 获取文章详情
window.api.getArticleById(id);

// 删除文章
window.api.deleteArticle(id);

// 更新文章
window.api.updateArticle(id, { title: '新标题', tags: ['新标签'] });

// 导出文章
window.api.exportArticles({
  articleIds: [1, 2, 3],
  format: 'markdown',
  outputPath: '/path/to/export',
  includeImages: true
});

// 监听采集进度
window.api.onScrapeProgress((progress) => {
  console.log(progress.current, progress.total, progress.currentArticle);
});
```

### 标签相关

```typescript
// 获取所有标签
window.api.getAllTags();

// 创建标签
window.api.createTag('技术', '#3b82f6');

// 更新标签
window.api.updateTag(id, '新名称', '#ef4444');

// 删除标签
window.api.deleteTag(id);

// 为文章添加标签
window.api.addTagToArticle(articleId, tagId);

// 移除文章标签
window.api.removeTagFromArticle(articleId, tagId);
```

### 搜索相关

```typescript
// 搜索文章
window.api.searchArticles({
  keyword: '关键词',
  tags: ['技术', 'AI'],
  author: '作者名',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  limit: 20,
  offset: 0
});

// 获取搜索建议
window.api.getSearchSuggestions('关键词');

// 获取统计数据
window.api.getStatistics();
```

### 系统相关

```typescript
// 获取系统路径
window.api.getSystemPath('documents');  // 'home', 'desktop', 'downloads', etc.

// 打开外部链接
window.api.openExternal('https://example.com');
```

---

## 下一步开发

### 1. 实现数据库模块

IPC处理器目前返回的是模拟数据，需要连接真实的数据库：

```typescript
// src/main/ipc/article.ts
import { ArticleDatabase } from '../database/article';

ipcMain.handle(IPC_CHANNELS.ARTICLE_GET_ALL, async (_event, limit, offset) => {
  const db = new ArticleDatabase();
  return await db.getAll(limit, offset);  // 连接真实数据库
});
```

### 2. 实现爬虫模块

连接爬虫引擎：

```typescript
// src/main/ipc/article.ts
import { WechatScraper } from '../scrapers/wechat';

ipcMain.handle(IPC_CHANNELS.ARTICLE_SCRAPE, async (_event, params) => {
  const scraper = new WechatScraper();
  const articles = await scraper.scrape(params);
  return { success: true, articles, total: articles.length };
});
```

### 3. 实现导出服务

添加文章导出功能：

```typescript
// src/main/services/exporter.ts
export class ArticleExporter {
  async exportToMarkdown(articles: Article[], outputPath: string) {
    // 实现Markdown导出
  }

  async exportToHTML(articles: Article[], outputPath: string) {
    // 实现HTML导出
  }

  async exportToPDF(articles: Article[], outputPath: string) {
    // 实现PDF导出
  }
}
```

### 4. 添加错误处理

完善错误处理和日志记录：

```typescript
// src/main/ipc/article.ts
ipcMain.handle(IPC_CHANNELS.ARTICLE_GET_ALL, async (_event, limit, offset) => {
  try {
    const db = new ArticleDatabase();
    const articles = await db.getAll(limit, offset);

    // 记录成功日志
    logger.info(`获取文章列表成功: ${articles.length}篇`);

    return articles;
  } catch (error) {
    // 记录错误日志
    logger.error('获取文章列表失败:', error);

    // 返回友好错误信息
    throw new Error('获取文章列表失败，请稍后重试');
  }
});
```

### 5. 添加测试

编写单元测试和集成测试：

```typescript
// tests/ipc/article.test.ts
import { test, expect } from 'vitest';

test('应该能获取文章列表', async () => {
  const articles = await window.api.getAllArticles(10, 0);
  expect(articles).toBeInstanceOf(Array);
  expect(articles.length).toBeLessThanOrEqual(10);
});

test('应该能删除文章', async () => {
  const result = await window.api.deleteArticle(1);
  expect(result).toBe(true);
});
```

---

## 常见问题排查

### ❌ 错误：`Cannot find name 'window'`

**解决方案：** 在 `tsconfig.web.json` 添加：

```json
{
  "compilerOptions": {
    "lib": ["DOM", "ES2020"]
  }
}
```

### ❌ 错误：`Property 'api' does not exist on type 'Window'`

**解决方案：** 在 `src/renderer/src/vite-env.d.ts` 添加类型声明：

```typescript
import type { IpcApi } from '../../types/ipc';

declare global {
  interface Window {
    api: IpcApi;
  }
}
```

### ❌ 错误：IPC调用超时

**排查步骤：**

1. 检查主进程控制台是否有错误
2. 确认IPC处理器已注册：`[IPC] ✅ 所有IPC处理器注册完成`
3. 检查通道名称是否正确
4. 确认Preload脚本已加载：`[Preload] ✅ API成功暴露到渲染进程`

### ❌ 错误：`window.api is undefined`

**排查步骤：**

1. 检查 `webPreferences.preload` 路径是否正确
2. 确认 `contextIsolation: true` 已开启
3. 查看Preload脚本是否执行 (检查日志)
4. 尝试重启开发服务器

---

## 性能建议

1. **批量操作优先**：避免在循环中多次调用IPC
2. **使用缓存**：对于不常变化的数据使用渲染进程缓存
3. **分页加载**：大列表使用分页或虚拟滚动
4. **防抖/节流**：搜索等高频操作使用防抖

---

## 总结

✅ **已完成：**
- IPC通信架构搭建
- 类型安全的API定义
- 安全的Preload桥接
- 模块化的IPC处理器
- 完整的使用示例

📝 **待实现：**
- 数据库集成
- 爬虫集成
- 导出服务
- 错误处理增强
- 单元测试

🎯 **下一步：**
参考 `dosc/IPC通信架构文档.md` 了解架构细节，然后开始实现数据库和爬虫模块。

---

**遇到问题？**
查看详细文档：`dosc/IPC通信架构文档.md`
查看示例代码：`src/renderer/src/examples/ipc-usage-example.tsx`
