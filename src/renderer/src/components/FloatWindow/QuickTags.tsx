import React, { useState } from 'react'
import { useFloatStore } from '../../store/floatStore'

/**
 * 快速标签选择器组件
 * - 常用标签快速选择
 * - 新建标签输入
 * - 标签颜色显示
 */
const QuickTags: React.FC = () => {
  const { frequentTags } = useFloatStore()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)

  // 预定义标签颜色映射
  const tagColors: Record<string, string> = {
    营销: 'bg-blue-100 text-blue-700 border-blue-300',
    微信: 'bg-green-100 text-green-700 border-green-300',
    教程: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    市场: 'bg-red-100 text-red-700 border-red-300',
    数据分析: 'bg-purple-100 text-purple-700 border-purple-300',
    default: 'bg-gray-100 text-gray-700 border-gray-300'
  }

  // 获取标签颜色
  const getTagColor = (tag: string): string => {
    return tagColors[tag] || tagColors.default
  }

  // 切换标签选择
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  // 添加新标签
  const handleAddNewTag = () => {
    if (newTagInput.trim()) {
      const newTag = newTagInput.trim()
      if (!selectedTags.includes(newTag)) {
        setSelectedTags([...selectedTags, newTag])
      }
      setNewTagInput('')
      setIsAddingTag(false)
    }
  }

  // 处理新标签输入的回车键
  const handleNewTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddNewTag()
    } else if (e.key === 'Escape') {
      setNewTagInput('')
      setIsAddingTag(false)
    }
  }

  // 移除已选标签
  const removeSelectedTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span>🏷️</span>
          <span>快速标签</span>
        </h3>
        <button
          onClick={() => setIsAddingTag(!isAddingTag)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          {isAddingTag ? '取消' : '+ 新建'}
        </button>
      </div>

      {/* 常用标签列表 */}
      <div className="flex flex-wrap gap-2">
        {frequentTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium border
              transition-all duration-200
              ${
                selectedTags.includes(tag)
                  ? getTagColor(tag) + ' ring-2 ring-offset-1 ring-current'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }
            `}
          >
            {selectedTags.includes(tag) && <span className="mr-1">✓</span>}
            {tag}
          </button>
        ))}
      </div>

      {/* 新建标签输入框 */}
      {isAddingTag && (
        <div className="flex gap-2 animate-fade-in">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleNewTagKeyPress}
            placeholder="输入新标签名称..."
            className="flex-1 px-3 py-2 text-sm border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            autoFocus
          />
          <button
            onClick={handleAddNewTag}
            disabled={!newTagInput.trim()}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium text-white
              transition-all duration-200
              ${
                newTagInput.trim()
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            添加
          </button>
        </div>
      )}

      {/* 已选标签显示 */}
      {selectedTags.length > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-2">已选标签:</div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium border
                  flex items-center gap-1.5
                  ${getTagColor(tag)}
                `}
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeSelectedTag(tag)}
                  className="hover:opacity-70 transition-opacity"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 使用提示 */}
      {selectedTags.length === 0 && !isAddingTag && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
          <p className="flex items-start gap-1">
            <span>💡</span>
            <span>点击标签快速选择，方便后续文章分类</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default QuickTags
