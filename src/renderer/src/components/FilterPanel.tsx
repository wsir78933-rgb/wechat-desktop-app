/**
 * 筛选面板组件
 */

import React, { useState } from 'react'
import { useArticleStore } from '../store/articleStore'
import type { SortOption } from '../types/article'

export const FilterPanel: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { filter, sort, setFilter, setSort } = useArticleStore((state) => ({
    filter: state.filter,
    sort: state.sort,
    setFilter: state.setFilter,
    setSort: state.setSort,
  }))

  const handleSortChange = (field: SortOption['field']) => {
    if (sort.field === field) {
      setSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' })
    } else {
      setSort({ field, order: 'desc' })
    }
  }

  const handleAccountChange = (accountName: string) => {
    setFilter({ accountName: accountName || undefined })
  }

  const handleFavoriteFilter = (value: string) => {
    if (value === 'all') {
      setFilter({ isFavorite: undefined })
    } else if (value === 'favorite') {
      setFilter({ isFavorite: true })
    } else {
      setFilter({ isFavorite: false })
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* 账号筛选 */}
      <div className="relative">
        <select
          value={filter.accountName || ''}
          onChange={(e) => handleAccountChange(e.target.value)}
          className="px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
        >
          <option value="">全部账号</option>
          <option value="营销大师">营销大师</option>
          <option value="运营专家">运营专家</option>
          <option value="数据分析师">数据分析师</option>
        </select>
        <svg
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* 高级筛选按钮 */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        筛选 {showAdvanced ? '▲' : '▼'}
      </button>

      {/* 排序选择 */}
      <div className="relative">
        <select
          value={sort.field}
          onChange={(e) => handleSortChange(e.target.value as SortOption['field'])}
          className="px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
        >
          <option value="createdAt">📅 采集时间</option>
          <option value="publishDate">📅 发布时间</option>
          <option value="title">🔤 标题</option>
        </select>
        <svg
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* 排序方向 */}
      <button
        onClick={() => setSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' })}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        title={sort.order === 'asc' ? '升序' : '降序'}
      >
        {sort.order === 'asc' ? '↑' : '↓'}
      </button>

      {/* 高级筛选面板 */}
      {showAdvanced && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="grid grid-cols-2 gap-4">
            {/* 日期范围 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">日期范围</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filter.dateRange?.start || ''}
                  onChange={(e) =>
                    setFilter({
                      dateRange: { ...filter.dateRange, start: e.target.value, end: filter.dateRange?.end || '' },
                    })
                  }
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="date"
                  value={filter.dateRange?.end || ''}
                  onChange={(e) =>
                    setFilter({
                      dateRange: { start: filter.dateRange?.start || '', end: e.target.value },
                    })
                  }
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 收藏状态 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">收藏状态</label>
              <select
                onChange={(e) => handleFavoriteFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部</option>
                <option value="favorite">已收藏</option>
                <option value="unfavorite">未收藏</option>
              </select>
            </div>
          </div>

          {/* 重置按钮 */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilter({ keyword: '', tags: [], accountName: undefined, isFavorite: undefined, dateRange: undefined })
                setShowAdvanced(false)
              }}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              重置筛选
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
