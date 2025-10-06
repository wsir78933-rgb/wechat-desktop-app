/**
 * Loading 加载指示器组件
 * 支持不同尺寸、文本提示、遮罩层
 */
import React from 'react';
import { LoadingProps } from '../../types/ui';

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = '',
  overlay = false,
  className = '',
}) => {
  // 尺寸样式
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  // 加载动画
  const spinner = (
    <div
      className={`${sizeStyles[size]} border-blue-600 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label={text || '加载中'}
    >
      <span className="sr-only">{text || '加载中...'}</span>
    </div>
  );

  // 如果有遮罩层
  if (overlay) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50"
        role="alert"
        aria-busy="true"
        aria-live="polite"
      >
        {spinner}
        {text && <p className="mt-4 text-white text-lg font-medium">{text}</p>}
      </div>
    );
  }

  // 普通加载指示器
  return (
    <div className="flex flex-col items-center justify-center p-4" role="status">
      {spinner}
      {text && <p className="mt-2 text-gray-600 text-sm">{text}</p>}
    </div>
  );
};

// 加载点动画（三个点跳动）
export const LoadingDots: React.FC<{ text?: string }> = ({ text = '加载中' }) => {
  return (
    <div className="flex items-center justify-center space-x-1" role="status" aria-live="polite">
      <span className="text-gray-600">{text}</span>
      <span className="flex space-x-1">
        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse animation-delay-100" />
        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse animation-delay-200" />
        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse animation-delay-300" />
      </span>
    </div>
  );
};

// 骨架屏加载
export const SkeletonLoader: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="内容加载中">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ width: `${100 - index * 10}%` }}
        />
      ))}
    </div>
  );
};

export default Loading;
