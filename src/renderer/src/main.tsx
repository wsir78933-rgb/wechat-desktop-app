import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/global.css';
import './styles/animations.css';

// 开发环境下加载测试函数
if (import.meta.env.DEV) {
  import('./test-functions').then(() => {
    console.log('✅ 测试函数加载完成');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
