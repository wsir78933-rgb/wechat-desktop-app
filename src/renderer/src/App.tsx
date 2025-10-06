import { useEffect } from 'react'
import { MainLayout } from './components/MainLayout'
import { useArticleStore } from './store/articleStore'

function App() {
  const fetchArticles = useArticleStore((state) => state.fetchArticles)

  // 应用启动时加载文章数据
  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  return (
    <div className="w-screen h-screen overflow-hidden">
      <MainLayout />
    </div>
  )
}

export default App
