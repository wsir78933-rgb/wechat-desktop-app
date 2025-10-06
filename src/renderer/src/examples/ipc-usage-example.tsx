/**
 * IPC通信使用示例
 * 展示如何在渲染进程中调用主进程API
 */

import React, { useState, useEffect } from 'react';
import type { Article, Tag, SearchParams } from '../../../types/ipc';

/**
 * 文章列表组件示例
 */
export function ArticleListExample() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载文章列表
  const loadArticles = async () => {
    setLoading(true);
    setError(null);

    try {
      // 调用主进程API获取文章
      const data = await window.api.getAllArticles(20, 0);
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      console.error('加载文章失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 删除文章
  const deleteArticle = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗?')) return;

    try {
      const success = await window.api.deleteArticle(id);
      if (success) {
        // 从列表中移除
        setArticles((prev) => prev.filter((a) => a.id !== id));
        alert('删除成功');
      } else {
        alert('删除失败');
      }
    } catch (err) {
      console.error('删除文章失败:', err);
      alert('删除失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">文章列表</h2>

      {loading && <p>加载中...</p>}
      {error && <p className="text-red-500">错误: {error}</p>}

      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="border p-4 rounded">
            <h3 className="font-bold">{article.title}</h3>
            <p className="text-sm text-gray-600">作者: {article.author}</p>
            <p className="text-sm text-gray-600">发布: {article.publishDate}</p>
            <div className="mt-2 flex gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => article.id && deleteArticle(article.id)}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 文章采集组件示例
 */
export function ArticleScrapeExample() {
  const [url, setUrl] = useState('');
  const [accountName, setAccountName] = useState('');
  const [progress, setProgress] = useState<string>('');
  const [isScrapeing, setIsScrapeing] = useState(false);

  // 注册采集进度监听
  useEffect(() => {
    window.api.onScrapeProgress((progressData) => {
      setProgress(
        `采集进度: ${progressData.current}/${progressData.total} - ${progressData.currentArticle}`
      );

      if (progressData.status === 'completed') {
        setIsScrapeing(false);
        alert('采集完成!');
      }
    });
  }, []);

  // 开始采集
  const startScrape = async () => {
    if (!url || !accountName) {
      alert('请填写完整信息');
      return;
    }

    setIsScrapeing(true);
    setProgress('正在启动采集...');

    try {
      const result = await window.api.scrapeArticles({
        url,
        accountName,
        maxArticles: 50,
      });

      if (result.success) {
        alert(`采集成功！共采集 ${result.total} 篇文章`);
      } else {
        alert(`采集失败: ${result.error}`);
      }
    } catch (err) {
      console.error('采集失败:', err);
      alert('采集失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setIsScrapeing(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">文章采集</h2>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">公众号URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="https://mp.weixin.qq.com/..."
            disabled={isScrapeing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">公众号名称</label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="输入公众号名称"
            disabled={isScrapeing}
          />
        </div>

        <button
          onClick={startScrape}
          disabled={isScrapeing}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isScrapeing ? '采集中...' : '开始采集'}
        </button>

        {progress && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm">{progress}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 搜索组件示例
 */
export function SearchExample() {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取搜索建议
  const fetchSuggestions = async (value: string) => {
    if (!value) {
      setSuggestions([]);
      return;
    }

    try {
      const data = await window.api.getSearchSuggestions(value);
      setSuggestions(data);
    } catch (err) {
      console.error('获取搜索建议失败:', err);
    }
  };

  // 搜索文章
  const search = async () => {
    if (!keyword) return;

    setLoading(true);

    try {
      const params: SearchParams = {
        keyword,
        limit: 20,
        offset: 0,
      };

      const result = await window.api.searchArticles(params);
      setResults(result.articles);
    } catch (err) {
      console.error('搜索失败:', err);
      alert('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">文章搜索</h2>

      <div className="space-y-4 max-w-2xl">
        <div className="relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            onKeyPress={(e) => e.key === 'Enter' && search()}
            className="w-full border rounded px-3 py-2"
            placeholder="输入关键词搜索..."
          />

          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setKeyword(suggestion);
                    setSuggestions([]);
                    search();
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={search}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '搜索中...' : '搜索'}
        </button>

        <div className="space-y-3">
          {results.map((article) => (
            <div key={article.id} className="border p-4 rounded">
              <h3 className="font-bold">{article.title}</h3>
              <p className="text-sm text-gray-600">作者: {article.author}</p>
              <p className="text-sm line-clamp-2 mt-2">{article.content}</p>
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && keyword && <p className="text-gray-500">没有找到相关文章</p>}
      </div>
    </div>
  );
}

/**
 * 标签管理组件示例
 */
export function TagManagementExample() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');

  // 加载标签列表
  const loadTags = async () => {
    try {
      const data = await window.api.getAllTags();
      setTags(data);
    } catch (err) {
      console.error('加载标签失败:', err);
    }
  };

  // 创建标签
  const createTag = async () => {
    if (!newTagName) {
      alert('请输入标签名称');
      return;
    }

    try {
      const result = await window.api.createTag(newTagName, newTagColor);

      if (result.success && result.tag) {
        setTags([...tags, result.tag]);
        setNewTagName('');
        setNewTagColor('#3b82f6');
        alert('标签创建成功');
      } else {
        alert(result.message || '创建失败');
      }
    } catch (err) {
      console.error('创建标签失败:', err);
      alert('创建失败');
    }
  };

  // 删除标签
  const deleteTag = async (id: number) => {
    if (!confirm('确定要删除这个标签吗?')) return;

    try {
      const success = await window.api.deleteTag(id);
      if (success) {
        setTags(tags.filter((t) => t.id !== id));
        alert('删除成功');
      }
    } catch (err) {
      console.error('删除标签失败:', err);
      alert('删除失败');
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">标签管理</h2>

      <div className="space-y-4 max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="新标签名称"
          />
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="w-16 border rounded"
          />
          <button
            onClick={createTag}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            添加
          </button>
        </div>

        <div className="space-y-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: tag.color || '#6b7280' }}
                />
                <span className="font-medium">{tag.name}</span>
                <span className="text-sm text-gray-500">({tag.count || 0})</span>
              </div>
              <button
                onClick={() => tag.id && deleteTag(tag.id)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
