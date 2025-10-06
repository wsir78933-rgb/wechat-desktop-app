/**
 * TagList 标签列表组件
 * 显示标签列表，支持编辑、删除操作
 */
import React, { useState } from 'react';
import { Tag as TagType } from '../../types/tag';
import Tag from '../Common/Tag';
import Button from '../Common/Button';
import Input from '../Common/Input';

interface TagListProps {
  tags: TagType[];
  onEdit?: (tag: TagType) => void;
  onDelete?: (tagId: number) => void;
  onTagClick?: (tag: TagType) => void;
  searchable?: boolean;
  sortable?: boolean;
  className?: string;
}

const TagList: React.FC<TagListProps> = ({
  tags,
  onEdit,
  onDelete,
  onTagClick,
  searchable = true,
  sortable = true,
  className = '',
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 过滤标签
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // 排序标签
  const sortedTags = [...filteredTags].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name, 'zh-CN');
    } else if (sortBy === 'count') {
      comparison = (a.count || 0) - (b.count || 0);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: 'name' | 'count') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 搜索和排序 */}
      <div className="flex items-center justify-between space-x-4">
        {searchable && (
          <div className="flex-1">
            <Input
              type="search"
              value={searchKeyword}
              onChange={setSearchKeyword}
              placeholder="搜索标签..."
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
              aria-label="搜索标签"
            />
          </div>
        )}

        {sortable && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">排序：</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSort('name')}
              className="text-sm"
            >
              名称
              {sortBy === 'name' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSort('count')}
              className="text-sm"
            >
              数量
              {sortBy === 'count' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 标签列表 */}
      {sortedTags.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchKeyword ? '未找到匹配的标签' : '暂无标签'}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* 标签信息 */}
              <div className="flex items-center space-x-3 flex-1">
                <Tag
                  label={tag.name}
                  color={tag.color}
                  onClick={onTagClick ? () => onTagClick(tag) : undefined}
                />
                {tag.count !== undefined && (
                  <span className="text-sm text-gray-500">{tag.count} 篇文章</span>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(tag)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`编辑标签 ${tag.name}`}
                    title="编辑"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
                {onDelete && tag.id && (
                  <button
                    onClick={() => onDelete(tag.id!)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`删除标签 ${tag.name}`}
                    title="删除"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagList;
