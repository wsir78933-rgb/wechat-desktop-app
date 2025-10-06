import React, { useState, useEffect } from 'react'
import { useFloatStore } from '../../store/floatStore'

interface FloatLayoutProps {
  children: React.ReactNode
}

/**
 * 悬浮窗布局组件
 * - 无边框、透明背景设计
 * - 自定义标题栏with拖动功能
 * - 关闭、最小化、固定按钮
 * - 尺寸：400x600像素
 */
const FloatLayout: React.FC<FloatLayoutProps> = ({ children }) => {
  const { isAlwaysOnTop, setAlwaysOnTop } = useFloatStore()
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    // 监听置顶状态变化
    const handleAlwaysOnTopChanged = (isOnTop: boolean) => {
      setAlwaysOnTop(isOnTop)
    }

    if (window.api?.onAlwaysOnTopChanged) {
      window.api.onAlwaysOnTopChanged(handleAlwaysOnTopChanged)
    }
  }, [setAlwaysOnTop])

  const handleMinimize = () => {
    if (window.api?.minimize) {
      window.api.minimize()
    }
  }

  const handleClose = () => {
    if (window.api?.close) {
      window.api.close()
    }
  }

  const handleTogglePin = () => {
    if (window.api?.toggleAlwaysOnTop) {
      window.api.toggleAlwaysOnTop()
    }
  }

  return (
    <div className="w-[400px] h-[600px] flex flex-col bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
      {/* 自定义标题栏 - 可拖动 */}
      <div
        className={`
          flex items-center justify-between px-4 py-3
          bg-gradient-to-r from-blue-500 to-blue-600
          text-white select-none cursor-move
          ${isDragging ? 'opacity-80' : ''}
        `}
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        {/* 应用标题 */}
        <div className="flex items-center gap-2">
          <span className="text-xl">📰</span>
          <span className="font-semibold text-sm">公众号采集器</span>
        </div>

        {/* 窗口控制按钮 */}
        <div
          className="flex items-center gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {/* 置顶按钮 */}
          <button
            onClick={handleTogglePin}
            className={`
              w-7 h-7 rounded-full flex items-center justify-center
              transition-all duration-200
              ${
                isAlwaysOnTop
                  ? 'bg-yellow-400 hover:bg-yellow-500'
                  : 'bg-white/20 hover:bg-white/30'
              }
            `}
            title={isAlwaysOnTop ? '取消置顶' : '窗口置顶'}
          >
            <span className="text-xs">📌</span>
          </button>

          {/* 最小化按钮 */}
          <button
            onClick={handleMinimize}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200"
            title="最小化"
          >
            <span className="text-white text-lg leading-none">─</span>
          </button>

          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200"
            title="关闭"
          >
            <span className="text-white text-lg leading-none">✕</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {children}
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          拖动窗口可移动 • 快捷键 <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+Shift+A</kbd>
        </p>
      </div>
    </div>
  )
}

export default FloatLayout
