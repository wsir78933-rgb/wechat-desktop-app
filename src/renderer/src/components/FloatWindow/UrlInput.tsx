import React, { useState } from 'react'
import { useFloatStore } from '../../store/floatStore'

/**
 * URL输入组件
 * - 支持粘贴微信文章链接
 * - URL验证（必须是微信公众号文章）
 * - 快速抓取按钮
 * - 错误提示
 */
const UrlInput: React.FC = () => {
  const { inputUrl, setInputUrl, collectStatus, setCollectStatus, setCollectError, addRecentArticle } =
    useFloatStore()
  const [validationError, setValidationError] = useState<string | null>(null)

  // 验证微信公众号文章链接
  const validateWeChatUrl = (url: string): boolean => {
    const wechatPattern = /^https?:\/\/(mp\.weixin\.qq\.com|weixin\.qq\.com)\/s\/.+/
    return wechatPattern.test(url)
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setInputUrl(url)

    // 清除之前的错误
    setValidationError(null)
    setCollectError(null)

    // 实时验证（如果有输入内容）
    if (url && !validateWeChatUrl(url)) {
      setValidationError('请输入有效的微信公众号文章链接')
    }
  }

  // 处理粘贴事件
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedUrl = e.clipboardData.getData('text')
    setInputUrl(pastedUrl)

    if (!validateWeChatUrl(pastedUrl)) {
      setValidationError('粘贴的链接不是有效的微信公众号文章')
    } else {
      setValidationError(null)
    }
  }

  // 处理采集按钮点击
  const handleCollect = async () => {
    if (!inputUrl.trim()) {
      setValidationError('请输入文章链接')
      return
    }

    if (!validateWeChatUrl(inputUrl)) {
      setValidationError('请输入有效的微信公众号文章链接')
      return
    }

    try {
      setCollectStatus('loading')
      setValidationError(null)
      setCollectError(null)

      // 调用API采集文章
      if (window.api?.scrapeArticles) {
        const result = await window.api.scrapeArticles({
          urls: [inputUrl],
          tagIds: []
        })

        if (result.success && result.articles && result.articles.length > 0) {
          // 添加到最近文章列表
          addRecentArticle(result.articles[0])

          setCollectStatus('success')
          setInputUrl('') // 清空输入框

          // 3秒后重置状态
          setTimeout(() => {
            setCollectStatus('idle')
          }, 3000)
        } else {
          throw new Error(result.error || '采集失败')
        }
      } else {
        throw new Error('API未初始化')
      }
    } catch (error) {
      setCollectStatus('error')
      setCollectError(error instanceof Error ? error.message : '采集失败，请重试')

      // 5秒后重置错误状态
      setTimeout(() => {
        setCollectStatus('idle')
        setCollectError(null)
      }, 5000)
    }
  }

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCollect()
    }
  }

  return (
    <div className="space-y-3">
      {/* URL输入框 */}
      <div className="relative">
        <input
          type="text"
          value={inputUrl}
          onChange={handleInputChange}
          onPaste={handlePaste}
          onKeyPress={handleKeyPress}
          placeholder="粘贴或拖拽公众号文章链接..."
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500/50
            ${
              validationError
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }
          `}
          disabled={collectStatus === 'loading'}
        />

        {/* 加载指示器 */}
        {collectStatus === 'loading' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {validationError && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          <span>⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* 采集按钮 */}
      <button
        onClick={handleCollect}
        disabled={collectStatus === 'loading' || !inputUrl.trim() || !!validationError}
        className={`
          w-full py-3 rounded-lg font-semibold text-white
          transition-all duration-200 flex items-center justify-center gap-2
          ${
            collectStatus === 'loading' || !inputUrl.trim() || !!validationError
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {collectStatus === 'loading' ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>采集中...</span>
          </>
        ) : collectStatus === 'success' ? (
          <>
            <span>✅</span>
            <span>采集成功</span>
          </>
        ) : collectStatus === 'error' ? (
          <>
            <span>❌</span>
            <span>采集失败</span>
          </>
        ) : (
          <>
            <span>📥</span>
            <span>采集文章</span>
          </>
        )}
      </button>

      {/* 成功/错误消息 */}
      {collectStatus === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg animate-fade-in">
          <span>✅</span>
          <span>文章采集成功！已添加到列表</span>
        </div>
      )}

      {collectStatus === 'error' && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg animate-fade-in">
          <span>❌</span>
          <span>{useFloatStore.getState().collectError || '采集失败，请检查链接后重试'}</span>
        </div>
      )}

      {/* 使用提示 */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded-lg">
        <p className="flex items-start gap-1">
          <span>💡</span>
          <span>支持微信公众号文章链接（mp.weixin.qq.com）</span>
        </p>
      </div>
    </div>
  )
}

export default UrlInput
