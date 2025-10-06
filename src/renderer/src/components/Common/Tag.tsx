/**
 * Tag 标签组件
 * 支持不同颜色、尺寸、可删除
 */
import React from 'react';
import { TagComponentProps } from '../../types/ui';

const Tag: React.FC<TagComponentProps> = ({
  label,
  color = '#3b82f6',
  onRemove,
  onClick,
  size = 'md',
  className = '',
}) => {
  // 尺寸样式
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  // 基础样式
  const baseStyles = `inline-flex items-center rounded-full font-medium transition-all duration-200 ${sizeStyles[size]}`;

  // 可点击样式
  const clickableStyles = onClick ? 'cursor-pointer hover:opacity-80' : '';

  // 计算文本颜色（根据背景色自动选择黑色或白色）
  const getTextColor = (bgColor: string): string => {
    // 简单的亮度计算
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  const textColor = getTextColor(color);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <span
      className={`${baseStyles} ${clickableStyles} ${className}`}
      style={{ backgroundColor: color, color: textColor }}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={handleRemove}
          className="ml-1 -mr-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white"
          aria-label={`删除标签 ${label}`}
          type="button"
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag;
