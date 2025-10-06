/**
 * UI组件相关类型定义
 */
import { ReactNode } from 'react';

/**
 * 按钮变体类型
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

/**
 * 按钮尺寸
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * 按钮属性
 */
export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

/**
 * 输入框类型
 */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'search' | 'url';

/**
 * 输入框属性
 */
export interface InputProps {
  type?: InputType;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  icon?: ReactNode;
  className?: string;
  maxLength?: number;
  'aria-label'?: string;
}

/**
 * 下拉选项
 */
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

/**
 * 下拉选择器属性
 */
export interface SelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  className?: string;
  'aria-label'?: string;
}

/**
 * 模态框属性
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  'aria-label'?: string;
}

/**
 * Toast消息类型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast消息
 */
export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

/**
 * Toast属性
 */
export interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

/**
 * Loading加载指示器属性
 */
export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  overlay?: boolean;
  className?: string;
}

/**
 * 标签组件属性
 */
export interface TagComponentProps {
  label: string;
  color?: string;
  onRemove?: () => void;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 统计卡片属性
 */
export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  className?: string;
}

/**
 * 图表数据点
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

/**
 * 图表视图属性
 */
export interface ChartViewProps {
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'pie' | 'area';
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  height?: number;
  className?: string;
}

/**
 * 通用组件基础属性
 */
export interface BaseComponentProps {
  className?: string;
  'aria-label'?: string;
  id?: string;
}
