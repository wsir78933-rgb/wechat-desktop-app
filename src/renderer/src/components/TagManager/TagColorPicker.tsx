/**
 * TagColorPicker 标签颜色选择器组件
 * 用于选择标签颜色
 */
import React from 'react';
import { TAG_COLORS, TAG_COLOR_NAMES, TagColorKey } from '../../types/tag';

interface TagColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
}

const TagColorPicker: React.FC<TagColorPickerProps> = ({
  selectedColor,
  onColorChange,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">选择颜色</label>
      <div className="grid grid-cols-5 gap-2">
        {(Object.keys(TAG_COLORS) as TagColorKey[]).map((colorKey) => {
          const color = TAG_COLORS[colorKey];
          const isSelected = selectedColor === color;

          return (
            <button
              key={colorKey}
              type="button"
              onClick={() => onColorChange(color)}
              className={`relative w-10 h-10 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSelected ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`选择${TAG_COLOR_NAMES[colorKey]}`}
              title={TAG_COLOR_NAMES[colorKey]}
            >
              {isSelected && (
                <svg
                  className="absolute inset-0 m-auto w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      {/* 自定义颜色输入 */}
      <div className="mt-4">
        <label className="block text-xs text-gray-600 mb-1">或输入自定义颜色</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            aria-label="自定义颜色"
          />
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#3b82f6"
            maxLength={7}
            pattern="^#[0-9A-Fa-f]{6}$"
            aria-label="颜色代码"
          />
        </div>
      </div>
    </div>
  );
};

export default TagColorPicker;
