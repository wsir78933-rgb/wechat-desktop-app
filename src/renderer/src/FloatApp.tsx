import React from 'react'
import FloatLayout from './components/FloatWindow/FloatLayout'
import DropZone from './components/FloatWindow/DropZone'
import UrlInput from './components/FloatWindow/UrlInput'
import QuickTags from './components/FloatWindow/QuickTags'
import RecentArticles from './components/FloatWindow/RecentArticles'

/**
 * 悬浮窗主应用组件
 * 整合所有悬浮窗功能组件
 */
const FloatApp: React.FC = () => {
  return (
    <FloatLayout>
      {/* 内容区域 */}
      <div className="space-y-6">
        {/* 拖放区域 */}
        <DropZone />

        {/* 分隔线 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-xs text-gray-500 font-medium">或</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* URL输入和采集按钮 */}
        <UrlInput />

        {/* 分隔线 */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* 快速标签选择器 */}
        <QuickTags />

        {/* 分隔线 */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* 最近文章列表 */}
        <RecentArticles />
      </div>
    </FloatLayout>
  )
}

export default FloatApp
