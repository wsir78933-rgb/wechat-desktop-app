/**
 * StatCard 统计卡片组件
 * 用于显示统计数据，支持图标、趋势等
 */
import React from 'react';
import { StatCardProps } from '../../types/ui';

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = '#3b82f6',
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${className}`}
    >
      {/* 头部：标题和图标 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div
            className="flex-shrink-0 p-3 rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
        )}
      </div>

      {/* 趋势指示器 */}
      {trend && (
        <div className="flex items-center text-sm">
          {trend.isPositive ? (
            <svg
              className="w-4 h-4 text-green-500 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-red-500 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
            {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500 ml-1">vs 上周</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
