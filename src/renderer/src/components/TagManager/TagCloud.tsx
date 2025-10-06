/**
 * TagCloud 标签云组件
 * 以云状方式显示标签，标签大小根据使用频率调整
 */
import React from 'react';
import { Tag as TagType } from '../../types/tag';

interface TagCloudProps {
  tags: TagType[];
  onTagClick?: (tag: TagType) => void;
  maxFontSize?: number;
  minFontSize?: number;
  className?: string;
}

const TagCloud: React.FC<TagCloudProps> = ({
  tags,
  onTagClick,
  maxFontSize = 2,
  minFontSize = 0.875,
  className = '',
}) => {
  // 计算标签字体大小
  const calculateFontSize = (count: number, minCount: number, maxCount: number): number => {
    if (maxCount === minCount) return minFontSize;

    const ratio = (count - minCount) / (maxCount - minCount);
    return minFontSize + ratio * (maxFontSize - minFontSize);
  };

  // 获取最大最小计数
  const counts = tags.map((tag) => tag.count || 0);
  const maxCount = Math.max(...counts, 1);
  const minCount = Math.min(...counts, 0);

  // 计算文本颜色
  const getTextColor = (bgColor: string | undefined): string => {
    if (!bgColor) return '#000000';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  if (tags.length === 0) {
    return (
      <div className={`text-center py-12 text-gray-500 ${className}`}>暂无标签</div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-3 p-4 ${className}`} role="list" aria-label="标签云">
      {tags.map((tag) => {
        const fontSize = calculateFontSize(tag.count || 0, minCount, maxCount);
        const isClickable = !!onTagClick;

        return (
          <button
            key={tag.id}
            onClick={isClickable ? () => onTagClick!(tag) : undefined}
            disabled={!isClickable}
            className={`inline-flex items-center px-4 py-2 rounded-full font-medium transition-all duration-200 ${
              isClickable
                ? 'cursor-pointer hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                : 'cursor-default'
            }`}
            style={{
              fontSize: `${fontSize}rem`,
              backgroundColor: tag.color || '#3b82f6',
              color: getTextColor(tag.color),
            }}
            aria-label={`${tag.name} (${tag.count || 0} 篇文章)`}
            title={`${tag.name} - ${tag.count || 0} 篇文章`}
            role="listitem"
          >
            <span>{tag.name}</span>
            {tag.count !== undefined && tag.count > 0 && (
              <span className="ml-2 text-sm opacity-75">({tag.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TagCloud;
