# 快速参考 - React主窗口UI组件

## 启动命令

```bash
# 开发模式
npm run dev

# 类型检查
npm run typecheck:web

# 构建
npm run build
```

## 组件快速索引

### 导入组件
```typescript
import {
  MainLayout,      // 主布局
  SearchBar,       // 搜索栏
  FilterPanel,     // 筛选面板
  ArticleList,     // 文章列表
  ArticleCard,     // 文章卡片
  ArticleDetail    // 文章详情
} from '@/components'
```

### 使用Store
```typescript
import { useArticleStore } from '@/store/articleStore'

// 基本用法
const articles = useArticleStore(state => state.articles)

// 多个状态
const { articles, loading, fetchArticles } = useArticleStore(state => ({
  articles: state.articles,
  loading: state.loading,
  fetchArticles: state.fetchArticles
}))

// 调用方法
fetchArticles()
```

### 使用防抖Hook
```typescript
import { useDebounce } from '@/hooks/useDebounce'

const [keyword, setKeyword] = useState('')
const debouncedKeyword = useDebounce(keyword, 300)
```

## 文件位置

```
src/renderer/src/
├── components/
│   ├── MainLayout.tsx      # 主布局 (12KB)
│   ├── SearchBar.tsx       # 搜索栏 (2KB)
│   ├── FilterPanel.tsx     # 筛选 (6.4KB)
│   ├── ArticleList.tsx     # 列表 (7.9KB)
│   ├── ArticleCard.tsx     # 卡片 (5.4KB)
│   └── ArticleDetail.tsx   # 详情 (13KB)
├── store/
│   └── articleStore.ts     # 状态管理 (8KB)
├── hooks/
│   └── useDebounce.ts      # 防抖Hook (0.5KB)
└── types/
    └── article.ts          # 类型定义 (4KB)
```

## 核心功能API

### ArticleStore API

```typescript
// 数据状态
articles: Article[]
filteredArticles: Article[]
selectedArticle: Article | null
tags: Tag[]

// UI状态
filter: ArticleFilter
sort: SortOption
pagination: PaginationState
loading: boolean
error: string | null
selectedIds: Set<string>

// 数据操作
setArticles(articles: Article[]): void
fetchArticles(): Promise<void>
searchArticles(keyword: string): void

// 文章操作
toggleFavorite(id: string): void
updateArticleTags(id: string, tags: string[]): void
deleteArticles(ids: string[]): void

// 选择操作
toggleSelectArticle(id: string): void
selectAllArticles(): void
clearSelection(): void

// 筛选排序
setFilter(filter: Partial<ArticleFilter>): void
setSort(sort: SortOption): void
setPagination(pagination: Partial<PaginationState>): void
```

## 组件Props

### ArticleCard
```typescript
interface ArticleCardProps {
  article: Article
  isSelected: boolean
}
```

### MainLayout
```typescript
// 无props，自包含组件
```

### SearchBar
```typescript
// 无props，使用store
```

### FilterPanel
```typescript
// 无props，使用store
```

### ArticleList
```typescript
// 无props，使用store
```

### ArticleDetail
```typescript
// 无props，使用store中的selectedArticle
```

## 类型定义

```typescript
// 文章
interface Article {
  id?: number
  title: string
  author: string
  publishDate: string
  content: string
  url: string
  tags: string[]
  category?: string
  readCount?: number
  likeCount?: number
  createdAt?: string
  updatedAt?: string
}

// 筛选
interface ArticleFilter {
  keyword: string
  accountName?: string
  tags: string[]
  isFavorite?: boolean
  dateRange?: {
    start: string
    end: string
  }
}

// 排序
interface SortOption {
  field: 'publishDate' | 'createdAt' | 'title'
  order: 'asc' | 'desc'
}

// 分页
interface PaginationState {
  page: number
  pageSize: number
  total: number
}

// 导出格式
type ExportFormat = 'markdown' | 'html' | 'pdf' | 'json'
```

## 常用代码片段

### 获取文章列表
```typescript
useEffect(() => {
  fetchArticles()
}, [fetchArticles])
```

### 搜索文章
```typescript
const handleSearch = (keyword: string) => {
  searchArticles(keyword)
}
```

### 筛选文章
```typescript
setFilter({
  accountName: '营销大师',
  isFavorite: true
})
```

### 排序文章
```typescript
setSort({
  field: 'publishDate',
  order: 'desc'
})
```

### 批量删除
```typescript
const selectedArticleIds = Array.from(selectedIds)
deleteArticles(selectedArticleIds)
```

### 切换收藏
```typescript
toggleFavorite(articleId)
```

### 更新标签
```typescript
updateArticleTags(articleId, ['营销', '微信', '新标签'])
```

## Tailwind常用类

```css
/* 布局 */
.flex .flex-col .flex-1
.grid .grid-cols-4
.gap-2 .gap-3 .gap-4

/* 间距 */
.p-4 .px-4 .py-2
.m-4 .mx-4 .my-2

/* 颜色 */
.bg-blue-500 .text-white
.bg-gray-50 .text-gray-900

/* 边框 */
.border .border-gray-200
.rounded-lg .shadow-md

/* 过渡 */
.transition-all
.transition-colors
.hover:bg-gray-100
```

## 开发技巧

1. **热重载**: 修改组件后自动刷新
2. **TypeScript**: 使用VS Code的智能提示
3. **调试**: 使用React DevTools
4. **样式**: 使用Tailwind CSS IntelliSense
5. **状态**: 使用Zustand DevTools

## 故障排除

### Q: 组件不显示数据？
A: 检查是否调用了 `fetchArticles()`

### Q: 搜索没反应？
A: 检查防抖是否生效，等待300ms

### Q: 类型错误？
A: 运行 `npm run typecheck:web` 检查

### Q: 样式不生效？
A: 确认Tailwind配置正确

### Q: Store数据不更新？
A: 检查是否正确使用了store的set方法

## 性能优化建议

1. 使用 `React.memo` 包装纯组件
2. 使用 `useCallback` 缓存事件处理函数
3. 使用 `useMemo` 缓存计算结果
4. 启用虚拟滚动处理大列表
5. 避免在render中创建新对象

## 下一步

1. 完成main进程IPC API
2. 连接store与后端
3. 测试完整数据流
4. 添加更多功能页面

## 相关链接

- [组件文档](./src/renderer/src/components/README.md)
- [详细结构](./COMPONENT_STRUCTURE.md)
- [完整总结](./UI_COMPONENTS_SUMMARY.md)
- [UI设计](./dosc/UI界面设计_中文版.txt)

---

**更新时间**: 2025-10-06
