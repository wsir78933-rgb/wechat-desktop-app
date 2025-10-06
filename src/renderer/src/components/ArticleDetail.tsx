/**
 * 文章详情组件
 */

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useArticleStore } from '../store/articleStore'
import type { ExportFormat } from '../types/article'

export const ArticleDetail: React.FC = () => {
  const { selectedArticle, setSelectedArticle, updateArticleTags, toggleFavorite } =
    useArticleStore((state) => ({
      selectedArticle: state.selectedArticle,
      setSelectedArticle: state.setSelectedArticle,
      updateArticleTags: state.updateArticleTags,
      toggleFavorite: state.toggleFavorite,
    }))

  const [isEditingTags, setIsEditingTags] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [notes, setNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)

  if (!selectedArticle) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg">请选择一篇文章查看详情</p>
        </div>
      </div>
    )
  }

  // 处理标签添加
  const handleAddTag = () => {
    if (!tagInput.trim()) return
    const newTags = [...selectedArticle.tags, tagInput.trim()]
    updateArticleTags(String(selectedArticle.id), newTags)
    setTagInput('')
  }

  // 处理标签删除
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedArticle.tags.filter((tag) => tag !== tagToRemove)
    updateArticleTags(String(selectedArticle.id), newTags)
  }

  // 处理导出
  const handleExport = async (format: ExportFormat) => {
    // TODO: 实现导出功能
    alert(`导出为 ${format.toUpperCase()} 格式功能开发中...`)
  }

  // 格式化日期
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回列表
        </button>

        <div className="flex items-center gap-2">
          {/* 收藏按钮 */}
          <button
            onClick={() => toggleFavorite(String(selectedArticle.id))}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            收藏
          </button>

          {/* 标签编辑 */}
          <button
            onClick={() => setIsEditingTags(!isEditingTags)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            标签
          </button>

          {/* 导出菜单 */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              导出
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport('markdown')}
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-t-lg"
              >
                📝 Markdown
              </button>
              <button
                onClick={() => handleExport('html')}
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                🌐 HTML
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-b-lg"
              >
                📄 PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 文章内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* 文章标题 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{selectedArticle.title}</h1>

          {/* 文章元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>作者: {selectedArticle.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>发布时间: {formatDateTime(selectedArticle.publishDate)}</span>
            </div>
            {selectedArticle.createdAt && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>采集时间: {formatDateTime(selectedArticle.createdAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              <a
                href={selectedArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                原文链接
              </a>
            </div>
          </div>

          {/* 标签区域 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">标签:</span>
              <div className="flex flex-wrap gap-2">
                {selectedArticle.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                    {isEditingTags && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* 标签编辑区 */}
            {isEditingTags && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="输入新标签..."
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  添加
                </button>
                <button
                  onClick={() => setIsEditingTags(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  完成
                </button>
              </div>
            )}
          </div>

          {/* 文章内容 - Markdown渲染 */}
          <div className="prose prose-lg max-w-none mb-8">
            <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
          </div>

          {/* 笔记区域 */}
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📒 我的笔记</h3>
              <button
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {isEditingNotes ? '保存' : '✏️ 编辑'}
              </button>
            </div>
            {isEditingNotes ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="在这里记录你的想法和笔记..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            ) : (
              <div className="text-gray-700 whitespace-pre-wrap">
                {notes || '暂无笔记，点击编辑添加笔记...'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
