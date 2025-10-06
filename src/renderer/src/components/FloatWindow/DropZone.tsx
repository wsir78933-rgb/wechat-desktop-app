import React, { useState, useCallback } from 'react'
import { useFloatStore } from '../../store/floatStore'

/**
 * 拖放区域组件
 * - 支持拖放链接到悬浮窗
 * - 拖放区域高亮显示
 * - 自动识别URL
 */
const DropZone: React.FC = () => {
  const { setInputUrl } = useFloatStore()
  const [isDragOver, setIsDragOver] = useState(false)

  // 验证是否为有效的URL
  const isValidUrl = (text: string): boolean => {
    try {
      new URL(text)
      return true
    } catch {
      return false
    }
  }

  // 从拖拽数据中提取URL
  const extractUrl = useCallback((dataTransfer: DataTransfer): string | null => {
    // 尝试获取链接
    const url = dataTransfer.getData('text/uri-list') || dataTransfer.getData('text/plain')

    if (url && isValidUrl(url.trim())) {
      return url.trim()
    }

    // 尝试从HTML中提取链接
    const html = dataTransfer.getData('text/html')
    if (html) {
      const match = html.match(/href="([^"]+)"/)
      if (match && match[1]) {
        return match[1]
      }
    }

    return null
  }, [])

  // 处理拖拽进入
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  // 处理拖拽经过
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // 处理拖拽离开
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // 只在离开整个drop zone时才重置状态
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragOver(false)
    }
  }, [])

  // 处理放下
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const url = extractUrl(e.dataTransfer)

      if (url) {
        setInputUrl(url)
        // 可以添加一个提示
        console.log('已识别URL:', url)
      } else {
        // URL无效提示
        console.warn('未能识别有效的URL')
      }
    },
    [extractUrl, setInputUrl]
  )

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative rounded-lg border-2 border-dashed p-6
        transition-all duration-300 ease-in-out
        ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }
      `}
    >
      {/* 拖放提示内容 */}
      <div className="text-center">
        <div
          className={`
          text-4xl mb-3 transition-all duration-300
          ${isDragOver ? 'scale-125 animate-bounce' : ''}
        `}
        >
          {isDragOver ? '📥' : '🔗'}
        </div>

        <p
          className={`
          text-sm font-medium transition-colors duration-300
          ${isDragOver ? 'text-blue-600' : 'text-gray-600'}
        `}
        >
          {isDragOver ? '松开鼠标放置链接' : '拖拽文章链接到这里'}
        </p>

        <p className="text-xs text-gray-500 mt-2">
          {isDragOver ? '正在识别链接...' : '支持从浏览器、聊天工具等拖拽链接'}
        </p>
      </div>

      {/* 拖放动画效果 */}
      {isDragOver && (
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-blue-500/20 to-blue-400/20 animate-shimmer"></div>
        </div>
      )}
    </div>
  )
}

export default DropZone
