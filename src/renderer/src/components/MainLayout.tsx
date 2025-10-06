/**
 * 主布局组件 - 三栏式布局
 */

import React, { useState } from 'react'
import { SearchBar } from './SearchBar'
import { FilterPanel } from './FilterPanel'
import { ArticleList } from './ArticleList'
import { ArticleDetail } from './ArticleDetail'
import { useArticleStore } from '../store/articleStore'

type ViewMode = 'home' | 'articles' | 'tags' | 'favorites' | 'statistics' | 'settings'

export const MainLayout: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('articles')
  const { selectedArticle, pagination } = useArticleStore((state) => ({
    selectedArticle: state.selectedArticle,
    pagination: state.pagination,
  }))

  const handleCollect = () => {
    // TODO: 打开采集窗口
    alert('采集文章功能开发中...')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">📰 公众号管理</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 - 导航菜单 */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <nav className="p-4">
            <div className="space-y-2">
              {/* 首页 */}
              <button
                onClick={() => setViewMode('home')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  viewMode === 'home'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="font-medium">首页</span>
              </button>

              {/* 文章列表 */}
              <button
                onClick={() => setViewMode('articles')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  viewMode === 'articles'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">文章列表</span>
              </button>

              {/* 标签管理 */}
              <button
                onClick={() => setViewMode('tags')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  viewMode === 'tags'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">标签管理</span>
              </button>

              {/* 收藏夹 */}
              <button
                onClick={() => setViewMode('favorites')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  viewMode === 'favorites'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium">收藏夹</span>
              </button>

              {/* 数据统计 */}
              <button
                onClick={() => setViewMode('statistics')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  viewMode === 'statistics'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span className="font-medium">数据统计</span>
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              {/* 设置 */}
              <button
                onClick={() => setViewMode('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  viewMode === 'settings'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">设置</span>
              </button>
            </div>
          </nav>

          {/* 快捷采集区域 */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleCollect}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              采集文章
            </button>
          </div>
        </aside>

        {/* 中间内容区 - 文章列表或详情 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 搜索和筛选栏 */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-4">
              <SearchBar />
              <FilterPanel />
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">总文章数</div>
              <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">本月采集</div>
              <div className="text-2xl font-bold text-blue-600">0</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">收藏文章</div>
              <div className="text-2xl font-bold text-yellow-600">0</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">标签数</div>
              <div className="text-2xl font-bold text-green-600">0</div>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="flex-1 overflow-hidden">
            {selectedArticle ? (
              <ArticleDetail />
            ) : viewMode === 'articles' ? (
              <ArticleList />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg
                    className="w-24 h-24 mx-auto text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg">此功能开发中...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
