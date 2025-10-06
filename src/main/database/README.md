# 数据库模块文档

## 概述

本模块使用 `better-sqlite3` 提供高性能的同步数据库操作，支持：
- 文章的完整CRUD操作
- 标签管理和分类
- FTS5全文搜索
- 事务支持
- 数据库备份和优化

## 文件结构

```
database/
├── db.ts                  # 数据库连接管理
├── schema.sql             # 数据库表结构定义
├── articleService.ts      # 文章CRUD服务
├── tagService.ts          # 标签管理服务
├── searchService.ts       # 全文搜索服务
├── index.ts               # 统一导出
└── README.md              # 本文档
```

## 核心功能

### 1. 数据库管理 (db.ts)

#### 初始化数据库
```typescript
import { initDatabase, getDatabase } from './database';

// 初始化数据库（自动创建表和索引）
const db = initDatabase();

// 获取数据库实例
const db = getDatabase();
```

#### 事务操作
```typescript
import { runTransaction } from './database';

const result = runTransaction(() => {
  // 在事务中执行多个操作
  articleService.create(article1);
  articleService.create(article2);
  return true;
});
```

#### 数据库维护
```typescript
import { backupDatabase, optimizeDatabase, closeDatabase } from './database';

// 备份数据库
backupDatabase('/path/to/backup.db');

// 优化数据库（清理空间和重建索引）
optimizeDatabase();

// 关闭数据库连接
closeDatabase();
```

### 2. 文章服务 (articleService.ts)

#### 创建文章
```typescript
import { articleService } from './database';

const articleId = articleService.create({
  title: '文章标题',
  author: '作者',
  content: '文章内容（Markdown格式）',
  html_content: '<p>HTML格式内容</p>',
  summary: '文章摘要',
  cover_image: 'https://example.com/cover.jpg',
  source_url: 'https://example.com/article',
  public_account: '公众号名称',
  publish_time: Date.now(),
  tags: ['技术', '产品'], // 标签数组
});
```

#### 批量创建
```typescript
const ids = articleService.createBatch([article1, article2, article3]);
```

#### 查询文章
```typescript
// 根据ID查询
const article = articleService.getById(1);

// 分页查询（支持过滤和排序）
const result = articleService.query({
  page: 1,
  pageSize: 20,
  sortBy: 'created_at',
  sortOrder: 'DESC',
  is_favorite: 1,          // 只查收藏
  is_archived: 0,          // 排除归档
  public_account: '公众号', // 过滤公众号
  author: '作者',           // 过滤作者
  tag: '技术',              // 过滤标签
});

console.log(result.data);        // 文章列表
console.log(result.total);       // 总数
console.log(result.totalPages);  // 总页数
```

#### 更新文章
```typescript
// 更新指定字段
articleService.update(1, {
  title: '新标题',
  tags: ['技术', '新标签'],
});

// 增加阅读次数
articleService.incrementReadCount(1);

// 切换收藏状态
const isFavorite = articleService.toggleFavorite(1);

// 切换归档状态
const isArchived = articleService.toggleArchive(1);
```

#### 删除文章
```typescript
// 删除单篇
articleService.delete(1);

// 批量删除
const deletedCount = articleService.deleteBatch([1, 2, 3]);
```

#### 统计信息
```typescript
// 获取统计数据
const stats = articleService.getStats();
console.log(stats.total);          // 总文章数
console.log(stats.favoriteCount);  // 收藏数
console.log(stats.archivedCount);  // 归档数
console.log(stats.totalReadCount); // 总阅读数

// 获取公众号列表
const accounts = articleService.getPublicAccounts();
// [{ name: '公众号A', count: 10 }, ...]

// 获取作者列表
const authors = articleService.getAuthors();
// [{ name: '作者A', count: 5 }, ...]
```

### 3. 标签服务 (tagService.ts)

#### 创建和管理标签
```typescript
import { tagService } from './database';

// 创建标签
const tagId = tagService.create({
  name: '技术',
  color: '#1890ff',
  description: '技术相关文章',
});

// 获取或创建标签（不存在则创建）
const tagId = tagService.getOrCreate('技术', '#1890ff');

// 查询标签
const tag = tagService.getById(1);
const tag = tagService.getByName('技术');

// 获取所有标签
const allTags = tagService.getAll('name');        // 按名称排序
const allTags = tagService.getAll('article_count'); // 按文章数排序

// 获取热门标签
const popularTags = tagService.getPopular(10);
```

#### 标签操作
```typescript
// 更新标签
tagService.update(1, {
  name: '新名称',
  color: '#52c41a',
});

// 重命名标签
tagService.rename(1, '新技术');

// 合并标签（将源标签的文章转移到目标标签）
tagService.merge(sourceTagId, targetTagId);

// 删除标签
tagService.delete(1);
tagService.deleteBatch([1, 2, 3]);

// 清理未使用的标签
const cleanedCount = tagService.cleanupUnused();
```

#### 文章标签关联
```typescript
// 获取文章的标签
const tags = tagService.getArticleTags(articleId);

// 为文章添加标签
tagService.addToArticle(articleId, tagId);
tagService.addToArticleBatch(articleId, [tagId1, tagId2]);

// 移除文章的标签
tagService.removeFromArticle(articleId, tagId);

// 更新文章的所有标签
tagService.updateArticleTags(articleId, [tagId1, tagId2]);
```

#### 高级功能
```typescript
// 搜索标签
const tags = tagService.search('技术');

// 获取标签云数据
const tagCloud = tagService.getTagCloud();
// [{ name: '技术', value: 10, color: '#1890ff' }, ...]

// 获取相关标签
const relatedTags = tagService.getRelatedTags(tagId, 5);

// 获取统计信息
const stats = tagService.getStats();
console.log(stats.total);         // 总标签数
console.log(stats.usedCount);     // 使用中的标签数
console.log(stats.unusedCount);   // 未使用的标签数
```

### 4. 搜索服务 (searchService.ts)

#### 全文搜索
```typescript
import { searchService } from './database';

// 基本搜索
const result = searchService.search({
  query: '关键词',
  page: 1,
  pageSize: 20,
  fields: ['title', 'content'],  // 搜索字段
  is_favorite: 1,                // 可选过滤条件
  tag: '技术',
  dateFrom: Date.now() - 86400000, // 最近24小时
});

result.data.forEach(article => {
  console.log(article.title);
  console.log(article.snippet);  // 高亮的匹配片段
  console.log(article.rank);     // 相关性得分
});
```

#### 快速搜索
```typescript
// 快速搜索（只搜索标题和摘要）
const results = searchService.quickSearch('关键词', 10);
```

#### 搜索建议
```typescript
// 获取搜索建议
const suggestions = searchService.suggest('技', 5);
// [
//   { text: '技术', count: 10, type: 'tag' },
//   { text: '技术文章标题', count: 1, type: 'title' },
//   ...
// ]
```

#### 高级搜索
```typescript
// 支持 FTS5 布尔运算符
const result = searchService.advancedSearch(
  'React AND (hooks OR components)',  // FTS5查询语法
  {
    page: 1,
    pageSize: 20,
    is_favorite: 1,
  }
);
```

#### 相似文章推荐
```typescript
// 基于内容相似度推荐
const similarArticles = searchService.findSimilar(articleId, 5);
```

#### 索引维护
```typescript
// 重建索引（修复索引）
searchService.rebuildIndex();

// 优化索引（提高性能）
searchService.optimizeIndex();

// 获取索引统计
const stats = searchService.getStats();
console.log(stats.indexedArticles);  // 已索引文章数
console.log(stats.indexSize);        // 索引大小
```

## 数据库表结构

### articles 表（文章表）
- id: 主键
- title: 标题
- author: 作者
- content: 内容（Markdown）
- html_content: HTML内容
- summary: 摘要
- cover_image: 封面图
- source_url: 原文链接
- public_account: 公众号
- publish_time: 发布时间
- read_count: 阅读次数
- like_count: 点赞数
- is_favorite: 是否收藏
- is_archived: 是否归档
- created_at: 创建时间
- updated_at: 更新时间

### tags 表（标签表）
- id: 主键
- name: 标签名（唯一）
- color: 颜色
- description: 描述
- article_count: 文章数量（自动更新）
- created_at: 创建时间

### article_tags 表（文章-标签关联表）
- article_id: 文章ID
- tag_id: 标签ID
- created_at: 创建时间

### articles_fts 表（FTS5全文搜索索引）
- 虚拟表，索引 title, author, content, summary
- 使用 unicode61 分词器，支持中文

## 性能优化

### 数据库配置
- WAL模式：提高并发性能
- 64MB缓存：加快查询速度
- 内存临时存储：减少I/O

### 索引
- 主要字段都有索引
- FTS5全文搜索索引
- 复合索引优化多条件查询

### 触发器
- 自动更新 updated_at
- 自动同步 FTS5 索引
- 自动更新标签计数

## 使用示例

### 完整工作流示例
```typescript
import {
  initDatabase,
  articleService,
  tagService,
  searchService,
  runTransaction,
} from './database';

// 1. 初始化数据库
initDatabase();

// 2. 创建文章
const articleId = runTransaction(() => {
  return articleService.create({
    title: 'React Hooks 深入解析',
    author: '张三',
    content: '# React Hooks\n\n详细内容...',
    summary: 'React Hooks 使用指南',
    public_account: '前端技术',
    tags: ['React', 'JavaScript', '前端'],
  });
});

// 3. 查询文章
const articles = articleService.query({
  page: 1,
  pageSize: 20,
  tag: 'React',
  sortBy: 'created_at',
  sortOrder: 'DESC',
});

// 4. 搜索文章
const searchResults = searchService.search({
  query: 'React Hooks',
  fields: ['title', 'content'],
  page: 1,
  pageSize: 10,
});

// 5. 标签管理
const popularTags = tagService.getPopular(10);
const tagCloud = tagService.getTagCloud();

// 6. 文章操作
articleService.incrementReadCount(articleId);
articleService.toggleFavorite(articleId);

// 7. 相似推荐
const similar = searchService.findSimilar(articleId, 5);
```

## 注意事项

1. **同步API**: better-sqlite3 使用同步API，不要在主进程中执行耗时操作
2. **事务**: 批量操作务必使用事务以提高性能
3. **FTS5**: 全文搜索使用 FTS5，需要 SQLite 3.9.0+
4. **中文分词**: 使用 unicode61 分词器，支持基本中文分词
5. **数据备份**: 定期备份数据库文件
6. **性能优化**: 定期执行 VACUUM 和 ANALYZE

## 依赖

```json
{
  "dependencies": {
    "better-sqlite3": "^9.0.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.8"
  }
}
```

## 许可

MIT
