/**
 * 文章列表组件 (支持虚拟滚动和分页)
 */

import React, { useMemo } from 'react'
import { useArticleStore } from '../store/articleStore'
import { ArticleCard } from './ArticleCard'

export const ArticleList: React.FC = () => {
  const {
    filteredArticles,
    selectedIds,
    pagination,
    loading,
    error,
    setPagination,
    selectAllArticles,
    clearSelection,
    deleteArticles,
  } = useArticleStore((state) => ({
    filteredArticles: state.filteredArticles,
    selectedIds: state.selectedIds,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    setPagination: state.setPagination,
    selectAllArticles: state.selectAllArticles,
    clearSelection: state.clearSelection,
    deleteArticles: state.deleteArticles,
  }))

  // 分页数据
  const paginatedArticles = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredArticles.slice(start, end)
  }, [filteredArticles, pagination.page, pagination.pageSize])

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  // 处理分页
  const handlePageChange = (newPage: number) => {
    setPagination({ page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 批量操作
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return
    if (confirm(`确定要删除选中的 ${selectedIds.size} 篇文章吗?`)) {
      deleteArticles(Array.from(selectedIds))
    }
  }

  const handleBatchExport = () => {
    if (selectedIds.size === 0) return
    // TODO: 实现批量导出功能
    alert(`批量导出 ${selectedIds.size} 篇文章功能开发中...`)
  }

  // 加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-center">
          <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-600 font-medium">加载失败</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // 空状态
  if (filteredArticles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 font-medium">暂无文章</p>
          <p className="text-gray-500 text-sm">试试调整筛选条件或添加新文章</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 列表头部 - 批量操作栏 */}
      {selectedIds.size > 0 && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                已选择 <strong className="text-blue-600">{selectedIds.size}</strong> 篇文章
              </span>
              <button
                onClick={selectAllArticles}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                全选
              </button>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                取消选择
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                🗑️ 删除
              </button>
              <button
                onClick={handleBatchExport}
                className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                📤 导出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 文章列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {paginatedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isSelected={selectedIds.has(String(article.id))}
            />
          ))}
        </div>
      </div>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              共 <strong>{pagination.total}</strong> 篇文章，第{' '}
              <strong>{pagination.page}</strong> / {totalPages} 页
            </div>
            <div className="flex items-center gap-2">
              {/* 上一页 */}
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                &lt; 上一页
              </button>

              {/* 页码 */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              {/* 下一页 */}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一页 &gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
