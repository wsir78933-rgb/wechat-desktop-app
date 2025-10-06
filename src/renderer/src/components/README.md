# React UI 组件文档

## 概述

本目录包含公众号桌面应用的所有React UI组件，基于中文ASCII UI设计实现。

## 组件结构

### 主要组件

1. **MainLayout.tsx** - 主布局组件
   - 三栏式布局：左侧导航、中间内容、右侧详情
   - 顶部搜索和筛选栏
   - 底部统计卡片
   - 响应式设计，最小宽度1000px

2. **SearchBar.tsx** - 搜索栏组件
   - 实时搜索功能
   - 防抖处理（300ms）
   - 支持搜索文章、标签、作者

3. **FilterPanel.tsx** - 筛选面板组件
   - 账号筛选下拉框
   - 高级筛选面板（日期范围、收藏状态）
   - 排序选项（时间、标题）
   - 排序方向切换

4. **ArticleList.tsx** - 文章列表组件
   - 分页支持
   - 批量操作（删除、导出）
   - 选择/取消选择功能
   - 空状态和加载状态处理

5. **ArticleCard.tsx** - 文章卡片组件
   - 文章标题、作者、日期显示
   - 标签展示
   - 收藏按钮
   - 多选支持

6. **ArticleDetail.tsx** - 文章详情组件
   - Markdown内容渲染
   - 标签编辑功能
   - 笔记功能
   - 导出功能（Markdown/HTML/PDF）

## 状态管理

使用 Zustand 进行全局状态管理：

```typescript
// src/renderer/src/store/articleStore.ts
- articles: 文章列表
- filteredArticles: 筛选后的文章列表
- selectedArticle: 当前选中的文章
- filter: 筛选条件
- sort: 排序选项
- pagination: 分页状态
- selectedIds: 选中的文章ID集合
```

## 类型定义

```typescript
// src/renderer/src/types/article.ts
- Article: 文章数据类型
- ArticleFilter: 筛选参数类型
- SortOption: 排序选项类型
- PaginationState: 分页状态类型
- ExportFormat: 导出格式类型
```

## 使用示例

### 基本使用

```tsx
import { MainLayout } from './components/MainLayout'

function App() {
  return <MainLayout />
}
```

### 使用Store

```tsx
import { useArticleStore } from './store/articleStore'

function MyComponent() {
  const { articles, fetchArticles } = useArticleStore(state => ({
    articles: state.articles,
    fetchArticles: state.fetchArticles
  }))

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  return <div>{articles.length} 篇文章</div>
}
```

## 样式

使用 Tailwind CSS 进行样式设计：

- 响应式设计
- 统一的颜色方案
- 平滑的过渡动画
- 完全中文界面

## 功能特性

### 已实现

- ✅ 三栏式布局
- ✅ 搜索和筛选
- ✅ 文章列表展示
- ✅ 文章详情查看
- ✅ 分页功能
- ✅ 批量操作
- ✅ 标签管理
- ✅ Markdown渲染

### 待实现

- ⏳ 虚拟滚动优化
- ⏳ 导出功能实现
- ⏳ 图片预览功能
- ⏳ 笔记持久化
- ⏳ 标签颜色自定义
- ⏳ 数据统计图表

## 性能优化

1. **防抖搜索**: SearchBar组件使用300ms防抖
2. **分页加载**: ArticleList支持分页，避免一次加载大量数据
3. **条件渲染**: 根据状态显示不同内容
4. **React.memo**: 关键组件使用memo优化（可选）

## 注意事项

1. 所有组件都使用TypeScript编写，保证类型安全
2. 遵循React Hooks最佳实践
3. 使用函数式组件，避免使用class组件
4. 统一使用箭头函数导出组件
5. 组件文件名使用PascalCase命名

## 依赖包

- react: ^18.2.0
- react-dom: ^18.2.0
- zustand: ^4.4.7
- react-markdown: ^10.1.0
- react-window: ^2.2.0
- tailwindcss: ^3.4.0

## 开发建议

1. 组件应该保持单一职责
2. 复杂逻辑应提取到自定义hooks
3. 样式优先使用Tailwind utilities
4. 避免过度嵌套组件
5. 保持代码简洁易读

## 后续开发

1. 实现悬浮窗采集界面
2. 添加标签管理页面
3. 实现数据统计页面
4. 添加设置页面
5. 完善导出功能
