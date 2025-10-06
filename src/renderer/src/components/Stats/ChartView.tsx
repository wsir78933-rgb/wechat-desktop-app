/**
 * ChartView 简单图表组件
 * 使用纯CSS和SVG实现基础图表，无需外部依赖
 */
import React from 'react';
import type { ChartViewProps } from '../../types/ui';

const ChartView: React.FC<ChartViewProps> = ({
  data,
  type,
  title,
  xAxisKey = 'name',
  yAxisKey = 'value',
  height = 300,
  className = '',
}) => {
  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="flex items-center justify-center h-64 text-gray-500">暂无数据</div>
      </div>
    );
  }

  // 渲染条形图
  const renderBarChart = () => {
    const maxValue = Math.max(...data.map((d) => Number(d[yAxisKey]) || 0));

    return (
      <div className="space-y-2">
        {data.map((item, index) => {
          const value = Number(item[yAxisKey]) || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">{String(item[xAxisKey])}</span>
                <span className="text-gray-900 font-semibold">{value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 group-hover:bg-blue-700"
                  style={{ width: `${percentage}%` }}
                  role="progressbar"
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={maxValue}
                  aria-label={`${String(item[xAxisKey])}: ${value}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 渲染饼图（简化版）
  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + (Number(item[yAxisKey]) || 0), 0);
    const colors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#84cc16',
    ];

    return (
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* 饼图可视化（使用圆环图） */}
        <div className="relative" style={{ width: 200, height: 200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="20" />
            {data.map((item, index) => {
              const value = Number(item[yAxisKey]) || 0;
              const percentage = total > 0 ? (value / total) * 100 : 0;
              const circumference = 2 * Math.PI * 90;
              const offset = circumference - (percentage / 100) * circumference;
              const rotation = data
                .slice(0, index)
                .reduce(
                  (sum, d) => sum + ((Number(d[yAxisKey]) || 0) / total) * 360,
                  -90
                );

              return (
                <circle
                  key={index}
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="20"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  transform={`rotate(${rotation} 100 100)`}
                  className="transition-all duration-500 hover:stroke-width-24"
                />
              );
            })}
          </svg>
        </div>

        {/* 图例 */}
        <div className="space-y-2">
          {data.map((item, index) => {
            const value = Number(item[yAxisKey]) || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

            return (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">
                    {String(item[xAxisKey])}
                  </div>
                  <div className="text-xs text-gray-500">
                    {value} ({percentage}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染折线图（简化版）
  const renderLineChart = () => {
    const maxValue = Math.max(...data.map((d) => Number(d[yAxisKey]) || 0));
    const minValue = Math.min(...data.map((d) => Number(d[yAxisKey]) || 0));
    const range = maxValue - minValue || 1;

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height={height} className="overflow-visible">
          {/* 网格线 */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}

          {/* 折线路径 */}
          <polyline
            points={data
              .map((item, index) => {
                const value = Number(item[yAxisKey]) || 0;
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - ((value - minValue) / range) * 100;
                return `${x}%,${y}%`;
              })
              .join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 数据点 */}
          {data.map((item, index) => {
            const value = Number(item[yAxisKey]) || 0;
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((value - minValue) / range) * 100;

            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#3b82f6"
                className="hover:r-6 transition-all cursor-pointer"
              >
                <title>
                  {String(item[xAxisKey])}: {value}
                </title>
              </circle>
            );
          })}
        </svg>

        {/* X轴标签 */}
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          {data.map((item, index) => (
            <span key={index}>{String(item[xAxisKey])}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="mt-4">
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
        {(type === 'line' || type === 'area') && renderLineChart()}
      </div>
    </div>
  );
};

export default ChartView;
