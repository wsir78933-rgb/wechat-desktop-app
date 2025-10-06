import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Article, WindowPosition, CollectStatus } from '../types'

interface FloatStoreState {
  // 窗口状态
  position: WindowPosition
  isAlwaysOnTop: boolean

  // URL输入
  inputUrl: string

  // 采集状态
  collectStatus: CollectStatus
  collectError: string | null

  // 最近文章
  recentArticles: Article[]

  // 常用标签
  frequentTags: string[]

  // Actions
  setPosition: (position: WindowPosition) => void
  setAlwaysOnTop: (isOnTop: boolean) => void
  setInputUrl: (url: string) => void
  setCollectStatus: (status: CollectStatus) => void
  setCollectError: (error: string | null) => void
  setRecentArticles: (articles: Article[]) => void
  addRecentArticle: (article: Article) => void
  setFrequentTags: (tags: string[]) => void
}

export const useFloatStore = create<FloatStoreState>()(
  persist(
    (set) => ({
      // 初始状态
      position: { x: 100, y: 100 },
      isAlwaysOnTop: false,
      inputUrl: '',
      collectStatus: 'idle',
      collectError: null,
      recentArticles: [],
      frequentTags: ['营销', '微信', '教程', '市场', '数据分析'],

      // Actions
      setPosition: (position) => set({ position }),

      setAlwaysOnTop: (isOnTop) => set({ isAlwaysOnTop: isOnTop }),

      setInputUrl: (url) => set({ inputUrl: url }),

      setCollectStatus: (status) => set({ collectStatus: status }),

      setCollectError: (error) => set({ collectError: error }),

      setRecentArticles: (articles) => set({ recentArticles: articles }),

      addRecentArticle: (article) =>
        set((state) => ({
          recentArticles: [article, ...state.recentArticles].slice(0, 5)
        })),

      setFrequentTags: (tags) => set({ frequentTags: tags })
    }),
    {
      name: 'float-window-storage',
      partialize: (state) => ({
        position: state.position,
        isAlwaysOnTop: state.isAlwaysOnTop,
        frequentTags: state.frequentTags
      })
    }
  )
)
