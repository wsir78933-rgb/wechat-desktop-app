/**
 * 手动添加文章对话框组件
 * 允许用户手动输入文章信息并保存
 */

import React, { useState } from 'react';
import { X, Save, Link, User, Calendar, FileText, Tag } from 'lucide-react';
import type { Article } from '../types/article';

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: Partial<Article>) => Promise<void>;
}

export const AddArticleModal: React.FC<AddArticleModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    url: '',
    content: '',
    tags: '',
    publishDate: new Date().toISOString().split('T')[0]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.title.trim()) {
      setError('标题不能为空');
      return;
    }

    if (!formData.content.trim()) {
      setError('内容不能为空');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const article: Partial<Article> = {
        title: formData.title.trim(),
        author: formData.author.trim() || '未知作者',
        url: formData.url.trim() || `manual-${Date.now()}`,
        content: formData.content.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        publishDate: formData.publishDate,
        createdAt: new Date().toISOString()
      };

      await onSave(article);

      // 重置表单
      setFormData({
        title: '',
        author: '',
        url: '',
        content: '',
        tags: '',
        publishDate: new Date().toISOString().split('T')[0]
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-hidden shadow-xl">
        {/* 标题栏 */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">✍️ 手动添加文章</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 标题 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 mr-1" />
              文章标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入文章标题"
              required
            />
          </div>

          {/* 作者 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 mr-1" />
              作者
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入作者名称（选填）"
            />
          </div>

          {/* URL */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Link className="w-4 h-4 mr-1" />
              文章链接
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://... （选填）"
            />
          </div>

          {/* 发布日期 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              发布日期
            </label>
            <input
              type="date"
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 mr-1" />
              标签
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="标签1, 标签2, 标签3（用逗号分隔）"
            />
          </div>

          {/* 内容 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 mr-1" />
              文章内容 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入文章内容、笔记或摘要..."
              rows={8}
              required
            />
          </div>
        </form>

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isSaving}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? '保存中...' : '保存文章'}
          </button>
        </div>
      </div>
    </div>
  );
};