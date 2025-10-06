import React, { useEffect, useState } from 'react'
import { useFloatStore } from '../../store/floatStore'
import type { Article } from '../../types'

/**
 * 最近文章列表组件
 * - 最近5篇文章显示
 * - 文章卡片（缩略版）
 * - 点击打开主窗口详情
 */
const RecentArticles: React.FC = () => {
  const { recentArticles, setRecentArticles } = useFloatStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 加载最近文章
    const loadRecentArticles = async () => {
      try {
        setIsLoading(true)
        if (window.api?.getRecentArticles) {
          const articles = await window.api.getRecentArticles(5)
          setRecentArticles(articles)
        }
      } catch (error) {
        console.error('加载最近文章失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecentArticles()
  }, [setRecentArticles])

  // 格式化日期
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}年${month}月${day}日`
    } catch {
      return dateStr
    }
  }

  // 获取状态图标和样式
  const getStatusIcon = (tags: string[]) => {
    // 简化逻辑：根据标签数量显示不同图标
    if (tags.length >= 3) return { icon: '✅', color: 'text-green-600' }
    if (tags.length >= 1) return { icon: '⚠️', color: 'text-yellow-600' }
    return { icon: '🔵', color: 'text-blue-600' }
  }

  // 打开主窗口查看详情
  const handleViewArticle = (articleId: string | number | undefined) => {
    if (window.api?.openMainWindow && articleId) {
      window.api.openMainWindow(String(articleId))
    }
  }

  // 切换收藏状态（模拟）
  const handleToggleFavorite = (articleId: string | number | undefined, e: React.MouseEvent) => {
    e.stopPropagation() // 防止触发查看详情
    // TODO: 实现收藏功能
    console.log('切换收藏:', articleId)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">最近采集:</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recentArticles.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">最近采集:</h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-sm text-gray-500">暂无采集记录</p>
          <p className="text-xs text-gray-400 mt-1">开始采集你的第一篇文章吧</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <h3 className="text-sm font-semibold text-gray-700">最近采集:</h3>

      {/* 文章列表 */}
      <div className="space-y-2">
        {recentArticles.map((article) => {
          const status = getStatusIcon(article.tags)

          return (
            <div
              key={article.id}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => handleViewArticle(article.id)}
            >
              {/* 文章标题和状态 */}
              <div className="flex items-start gap-2 mb-2">
                <span className={`text-lg ${status.color} flex-shrink-0`}>
                  {status.icon}
                </span>
                <h4 className="text-sm font-medium text-gray-800 flex-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h4>
              </div>

              {/* 文章信息 */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                  <span>👤</span>
                  <span>{article.author}</span>
                </span>
                <span>{formatDate(article.publishDate)}</span>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleViewArticle(article.id)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  [查看]
                </button>
                <button
                  onClick={(e) => handleToggleFavorite(article.id, e)}
                  className="text-lg hover:scale-110 transition-transform"
                  title="收藏"
                >
                  {/* TODO: 根据实际收藏状态显示 */}
                  ☆
                </button>
              </div>

              {/* 标签 */}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                      +{article.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 查看更多 */}
      <button
        onClick={() => window.api?.openMainWindow()}
        className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200"
      >
        查看全部文章 →
      </button>
    </div>
  )
}

export default RecentArticles
