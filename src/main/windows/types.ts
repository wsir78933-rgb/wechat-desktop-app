/**
 * 窗口通信相关类型定义
 */

// 窗口类型
export enum WindowType {
  MAIN = 'main',
  FLOAT = 'float',
}

// 窗口状态
export interface WindowState {
  exists: boolean;
  visible?: boolean;
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
}

// 所有窗口状态
export interface AllWindowStates {
  main: WindowState;
  float: WindowState;
}

// 窗口消息
export interface WindowMessage<T = any> {
  type: string;
  data: T;
  from: WindowType;
  timestamp: number;
}

// IPC 通道定义
export const IPC_CHANNELS = {
  // 主窗口控制
  MAIN_WINDOW_SHOW: 'main-window:show',
  MAIN_WINDOW_HIDE: 'main-window:hide',
  MAIN_WINDOW_TOGGLE_DEVTOOLS: 'main-window:toggle-devtools',

  // 悬浮窗控制
  FLOAT_WINDOW_CREATE: 'float-window:create',
  FLOAT_WINDOW_SHOW: 'float-window:show',
  FLOAT_WINDOW_HIDE: 'float-window:hide',
  FLOAT_WINDOW_TOGGLE: 'float-window:toggle',
  FLOAT_WINDOW_CLOSE: 'float-window:close',

  // 悬浮窗位置和大小
  FLOAT_WINDOW_SET_POSITION: 'float-window:set-position',
  FLOAT_WINDOW_GET_POSITION: 'float-window:get-position',
  FLOAT_WINDOW_SET_SIZE: 'float-window:set-size',
  FLOAT_WINDOW_GET_SIZE: 'float-window:get-size',
  FLOAT_WINDOW_MOVE_TO_CENTER: 'float-window:move-to-center',
  FLOAT_WINDOW_MOVE_TO_RIGHT: 'float-window:move-to-right',

  // 悬浮窗属性
  FLOAT_WINDOW_SET_ALWAYS_ON_TOP: 'float-window:set-always-on-top',
  FLOAT_WINDOW_SET_OPACITY: 'float-window:set-opacity',

  // 窗口间通信
  WINDOW_SEND_TO_MAIN: 'window:send-to-main',
  WINDOW_SEND_TO_FLOAT: 'window:send-to-float',
  WINDOW_BROADCAST: 'window:broadcast',

  // 窗口状态
  WINDOW_GET_STATES: 'window:get-states',

  // 窗口消息
  FROM_MAIN_WINDOW: 'from-main-window',
  FROM_FLOAT_WINDOW: 'from-float-window',
} as const;

// IPC 响应类型
export interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 悬浮窗配置
export interface FloatWindowConfig {
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  alwaysOnTop?: boolean;
  opacity?: number;
}

// 主窗口配置
export interface MainWindowConfig {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
}
