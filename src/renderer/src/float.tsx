import React from 'react'
import ReactDOM from 'react-dom/client'
import FloatApp from './FloatApp'
import './index.css'

/**
 * 悬浮窗入口文件
 * 独立的React应用实例
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FloatApp />
  </React.StrictMode>
)
