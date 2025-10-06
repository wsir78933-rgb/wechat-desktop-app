/**
 * Input 输入框组件
 * 支持多种类型、图标、错误提示
 */
import React from 'react';
import { InputProps } from '../../types/ui';

const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  disabled = false,
  error,
  label,
  icon,
  className = '',
  maxLength,
  'aria-label': ariaLabel,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // 基础样式
  const baseStyles =
    'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-20';

  // 状态样式
  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

  // 禁用样式
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';

  // 图标样式
  const hasIcon = !!icon;
  const iconPadding = hasIcon ? 'pl-10' : '';

  // 组合样式
  const inputStyles = `${baseStyles} ${stateStyles} ${disabledStyles} ${iconPadding} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {maxLength && (
            <span className="text-xs text-gray-500 ml-2">
              ({value.length}/{maxLength})
            </span>
          )}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={inputStyles}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          aria-describedby={error ? 'input-error' : undefined}
        />
      </div>
      {error && (
        <p id="input-error" className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
