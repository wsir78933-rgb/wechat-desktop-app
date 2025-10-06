# 悬浮窗组件说明

## 概述

本目录包含公众号桌面应用的悬浮窗UI组件，基于React + TypeScript + Tailwind CSS开发。

## 组件结构

```
FloatWindow/
├── FloatLayout.tsx      # 悬浮窗布局容器（带自定义标题栏）
├── UrlInput.tsx         # URL输入和验证组件
├── QuickTags.tsx        # 快速标签选择器
├── RecentArticles.tsx   # 最近文章列表
├── DropZone.tsx         # 拖放区域组件
├── index.ts             # 组件统一导出
└── README.md            # 本文档
```

## 组件详解

### 1. FloatLayout.tsx
**悬浮窗布局组件**

#### 功能特性
- ✅ 无边框透明背景设计（毛玻璃效果）
- ✅ 自定义标题栏（可拖动）
- ✅ 窗口控制按钮（置顶、最小化、关闭）
- ✅ 固定尺寸：400x600像素
- ✅ 自定义滚动条样式

#### 使用方式
```tsx
import FloatLayout from './components/FloatWindow/FloatLayout'

<FloatLayout>
  {/* 其他组件内容 */}
</FloatLayout>
```

#### 窗口控制API
- `window.api.minimize()` - 最小化窗口
- `window.api.close()` - 关闭窗口
- `window.api.toggleAlwaysOnTop()` - 切换置顶状态

---

### 2. UrlInput.tsx
**URL输入和采集组件**

#### 功能特性
- ✅ 支持粘贴微信文章链接
- ✅ 实时URL验证（必须是微信公众号文章）
- ✅ 采集状态显示（加载中、成功、失败）
- ✅ 错误提示和成功反馈
- ✅ 支持回车键快速采集

#### 验证规则
仅接受以下格式的URL：
- `https://mp.weixin.qq.com/s/...`
- `http://mp.weixin.qq.com/s/...`
- `https://weixin.qq.com/s/...`

#### API调用
```tsx
// 采集文章
const article = await window.api.collectArticle(url)
```

---

### 3. QuickTags.tsx
**快速标签选择器**

#### 功能特性
- ✅ 常用标签快速选择（支持多选）
- ✅ 新建自定义标签
- ✅ 标签颜色区分
- ✅ 已选标签管理

#### 预设标签
- 营销（蓝色）
- 微信（绿色）
- 教程（黄色）
- 市场（红色）
- 数据分析（紫色）

#### 状态管理
使用Zustand store管理常用标签：
```tsx
const { frequentTags, setFrequentTags } = useFloatStore()
```

---

### 4. RecentArticles.tsx
**最近文章列表**

#### 功能特性
- ✅ 显示最近5篇采集的文章
- ✅ 文章卡片（缩略版）
- ✅ 点击打开主窗口查看详情
- ✅ 收藏功能切换
- ✅ 标签显示（最多3个+更多提示）
- ✅ 加载状态和空状态处理

#### API调用
```tsx
// 获取最近文章
const articles = await window.api.getRecentArticles(5)

// 打开主窗口
window.api.openMainWindow(articleId)
```

---

### 5. DropZone.tsx
**拖放区域组件**

#### 功能特性
- ✅ 支持拖放链接到悬浮窗
- ✅ 拖放区域高亮显示
- ✅ 自动识别URL
- ✅ 拖放动画效果
- ✅ 多种数据源支持（文本、HTML、URI列表）

#### 拖放事件处理
- `onDragEnter` - 拖拽进入
- `onDragOver` - 拖拽经过
- `onDragLeave` - 拖拽离开
- `onDrop` - 放下

---

## 状态管理

### Zustand Store (floatStore.ts)

```tsx
interface FloatStoreState {
  // 窗口状态
  position: WindowPosition
  isAlwaysOnTop: boolean

  // URL输入
  inputUrl: string

  // 采集状态
  collectStatus: CollectStatus
  collectError: string | null

  // 数据
  recentArticles: Article[]
  frequentTags: string[]
}
```

#### 持久化存储
以下状态会持久化到localStorage：
- `position` - 窗口位置
- `isAlwaysOnTop` - 置顶状态
- `frequentTags` - 常用标签

---

## 样式设计

### Tailwind CSS类名约定
- **毛玻璃效果**: `bg-white/95 backdrop-blur-lg`
- **阴影**: `shadow-2xl`, `hover:shadow-xl`
- **圆角**: `rounded-lg`, `rounded-2xl`, `rounded-full`
- **过渡**: `transition-all duration-200`
- **渐变**: `bg-gradient-to-r from-blue-500 to-blue-600`

### 自定义CSS动画
在 `index.css` 中定义：
- `animate-fade-in` - 淡入动画
- `animate-shimmer` - 闪光动画
- `scrollbar-thin` - 自定义滚动条

---

## 完整使用示例

### FloatApp.tsx
```tsx
import React from 'react'
import {
  FloatLayout,
  DropZone,
  UrlInput,
  QuickTags,
  RecentArticles
} from './components/FloatWindow'

const FloatApp: React.FC = () => {
  return (
    <FloatLayout>
      <div className="space-y-6">
        <DropZone />

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-xs text-gray-500 font-medium">或</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <UrlInput />
        <div className="border-t border-gray-200 my-4"></div>

        <QuickTags />
        <div className="border-t border-gray-200 my-4"></div>

        <RecentArticles />
      </div>
    </FloatLayout>
  )
}

export default FloatApp
```

---

## 入口文件

### float.tsx
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import FloatApp from './FloatApp'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FloatApp />
  </React.StrictMode>
)
```

### float.html
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>公众号采集器 - 悬浮窗</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/float.tsx"></script>
  </body>
</html>
```

---

## IPC通信接口

所有组件通过 `window.api` 与主进程通信：

```typescript
interface WindowAPI {
  // 窗口控制
  minimize: () => void
  close: () => void
  toggleAlwaysOnTop: () => void
  onAlwaysOnTopChanged: (callback: (isOnTop: boolean) => void) => void

  // 文章采集
  collectArticle: (url: string) => Promise<Article>
  getRecentArticles: (limit?: number) => Promise<Article[]>

  // 窗口通信
  openMainWindow: (articleId?: string) => void
  getWindowPosition: () => Promise<WindowPosition>
  setWindowPosition: (position: WindowPosition) => void
}
```

---

## UI设计参考

基于 `/dosc/UI界面设计_中文版.txt` 中的【界面 1】悬浮窗采集界面设计：

```
┌─────────────────────────────────────────┐
│  📰 公众号采集器            ○ ─ ✕      │  ← 标题栏（可拖拽）
├─────────────────────────────────────────┤
│  [拖放区域]                             │
│  粘贴或拖拽公众号文章链接...            │
│  📥 采集文章                            │
│                                         │
│  快速标签: [营销] [微信] [教程] ...     │
│                                         │
│  最近采集:                              │
│  ✅ 微信营销技巧大揭秘 [查看] [⭐]      │
│  ...                                    │
└─────────────────────────────────────────┘
```

---

## 开发注意事项

1. **TypeScript严格模式**: 所有组件必须使用TypeScript并定义明确的类型
2. **中文界面**: 所有UI文本必须使用简体中文
3. **响应式设计**: 虽然悬浮窗尺寸固定，但组件内部需要适配不同内容长度
4. **错误处理**: 所有API调用必须包含try-catch和用户友好的错误提示
5. **性能优化**: 使用React.memo、useCallback等避免不必要的重渲染

---

## 快捷键

- `Ctrl+Shift+A` - 显示/隐藏悬浮窗（全局快捷键）
- `Enter` - 在URL输入框中快速采集
- `Escape` - 取消新建标签输入

---

## 后续开发计划

- [ ] 添加文章预览功能
- [ ] 支持批量导入链接
- [ ] 历史记录搜索
- [ ] 自定义快捷键
- [ ] 主题切换（亮色/暗色）
- [ ] 窗口透明度调节
