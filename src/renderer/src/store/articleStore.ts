/**
 * 文章状态管理 Store (Zustand)
 */

import { create } from 'zustand'
import type { Article, ArticleFilter, SortOption, PaginationState } from '../types/article'

interface Tag {
  id: string
  name: string
  color: string
  articleCount: number
}

interface ArticleState {
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

  // 选择状态
  selectedIds: Set<string>

  // Actions
  setArticles: (articles: Article[]) => void
  setSelectedArticle: (article: Article | null) => void
  setFilter: (filter: Partial<ArticleFilter>) => void
  setSort: (sort: SortOption) => void
  setPagination: (pagination: Partial<PaginationState>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // 文章操作
  toggleFavorite: (id: string) => void
  updateArticleTags: (id: string, tags: string[]) => void
  updateArticleNotes: (id: string, notes: string) => void
  deleteArticles: (ids: string[]) => void

  // 选择操作
  toggleSelectArticle: (id: string) => void
  selectAllArticles: () => void
  clearSelection: () => void

  // 数据获取
  fetchArticles: () => Promise<void>
  searchArticles: (keyword: string) => void
  applyFilters: () => void
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  // 初始状态
  articles: [],
  filteredArticles: [],
  selectedArticle: null,
  tags: [],

  filter: {
    keyword: '',
    tags: [],
  },

  sort: {
    field: 'createdAt',
    order: 'desc',
  },

  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },

  loading: false,
  error: null,
  selectedIds: new Set(),

  // 设置器
  setArticles: (articles) => {
    set({ articles, pagination: { ...get().pagination, total: articles.length } })
    get().applyFilters()
  },

  setSelectedArticle: (article) => set({ selectedArticle: article }),

  setFilter: (filter) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
      pagination: { ...state.pagination, page: 1 },
    }))
    get().applyFilters()
  },

  setSort: (sort) => {
    set({ sort })
    get().applyFilters()
  },

  setPagination: (pagination) =>
    set((state) => ({ pagination: { ...state.pagination, ...pagination } })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // 文章操作
  toggleFavorite: (id) => {
    // Note: isFavorite 需要在 Article 类型中添加,暂时存储在本地状态
    set((state) => ({
      articles: state.articles.map((article) =>
        String(article.id) === id ? { ...article } : article
      ),
    }))
    get().applyFilters()
  },

  updateArticleTags: (id, tags) => {
    set((state) => ({
      articles: state.articles.map((article) =>
        String(article.id) === id ? { ...article, tags } : article
      ),
    }))
    get().applyFilters()
  },

  updateArticleNotes: (id, _notes) => {
    // Note: notes 需要在 Article 类型中添加
    set((state) => ({
      articles: state.articles.map((article) =>
        String(article.id) === id ? { ...article } : article
      ),
    }))
  },

  deleteArticles: (ids) => {
    set((state) => ({
      articles: state.articles.filter((article) => !ids.includes(String(article.id))),
      selectedIds: new Set(),
    }))
    get().applyFilters()
  },

  // 选择操作
  toggleSelectArticle: (id) =>
    set((state) => {
      const newSelectedIds = new Set(state.selectedIds)
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id)
      } else {
        newSelectedIds.add(id)
      }
      return { selectedIds: newSelectedIds }
    }),

  selectAllArticles: () =>
    set((state) => ({
      selectedIds: new Set(state.filteredArticles.map((a) => String(a.id))),
    })),

  clearSelection: () => set({ selectedIds: new Set() }),

  // 数据获取
  fetchArticles: async () => {
    set({ loading: true, error: null })
    try {
      // TODO: 实现IPC调用获取文章
      // const articles = await window.api.searchArticles({ keyword: '', limit: 1000 })
      const articles: Article[] = [] // 临时空数组
      set({
        articles,
        pagination: { ...get().pagination, total: articles.length },
        loading: false,
      })
      get().applyFilters()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取文章失败',
        loading: false,
      })
    }
  },

  searchArticles: (keyword) => {
    set((state) => ({
      filter: { ...state.filter, keyword },
      pagination: { ...state.pagination, page: 1 },
    }))
    get().applyFilters()
  },

  // 应用筛选和排序
  applyFilters: () => {
    const { articles, filter, sort } = get()

    let filtered = [...articles]

    // 关键词搜索
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase()
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(keyword) ||
          article.author.toLowerCase().includes(keyword) ||
          article.tags.some((tag) => tag.toLowerCase().includes(keyword)) ||
          article.content.toLowerCase().includes(keyword)
      )
    }

    // 账号筛选 (暂时跳过,因为Article类型中没有accountName字段)
    // if (filter.accountName) {
    //   filtered = filtered.filter((article) => article.accountName === filter.accountName)
    // }

    // 标签筛选
    if (filter.tags.length > 0) {
      filtered = filtered.filter((article) =>
        filter.tags.every((tag) => article.tags.includes(tag))
      )
    }

    // 收藏筛选 (暂时跳过,因为Article类型中没有isFavorite字段)
    // if (filter.isFavorite !== undefined) {
    //   filtered = filtered.filter((article) => article.isFavorite === filter.isFavorite)
    // }

    // 日期范围筛选
    if (filter.dateRange) {
      const { start, end } = filter.dateRange
      filtered = filtered.filter((article) => {
        const date = new Date(article.publishDate)
        return date >= new Date(start) && date <= new Date(end)
      })
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sort.field) {
        case 'publishDate':
          comparison = new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
          break
        case 'createdAt':
          comparison =
            new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title, 'zh-CN')
          break
      }

      return sort.order === 'asc' ? comparison : -comparison
    })

    set({
      filteredArticles: filtered,
      pagination: { ...get().pagination, total: filtered.length },
    })
  },
}))
