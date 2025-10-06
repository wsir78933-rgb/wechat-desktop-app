/**
 * Select 下拉选择器组件
 * 支持选项列表、禁用状态、错误提示
 */
import React from 'react';
import { SelectProps } from '../../types/ui';

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '请选择',
  disabled = false,
  label,
  error,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    // 尝试转换为数字（如果原始值是数字）
    const option = options.find((opt) => String(opt.value) === selectedValue);
    if (option) {
      onChange(option.value);
    }
  };

  // 基础样式
  const baseStyles =
    'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-20 appearance-none bg-white';

  // 状态样式
  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

  // 禁用样式
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : '';

  // 组合样式
  const selectStyles = `${baseStyles} ${stateStyles} ${disabledStyles} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="relative">
        <select
          value={String(value)}
          onChange={handleChange}
          disabled={disabled}
          className={selectStyles}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          aria-describedby={error ? 'select-error' : undefined}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={String(option.value)}
              value={String(option.value)}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* 下拉箭头图标 */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p id="select-error" className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
