/**
 * 应用配置持久化存储
 * 使用electron-store保存应用配置和窗口状态
 */

import Store from 'electron-store';

/**
 * 窗口位置类型
 */
export interface WindowPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

/**
 * 窗口状态类型
 */
export interface WindowState {
  position: WindowPosition;
  alwaysOnTop: boolean;
  opacity?: number;
}

/**
 * 应用配置类型
 */
interface AppConfig {
  // 悬浮窗状态
  floatWindow: WindowState;
  // 主窗口状态
  mainWindow: {
    position: WindowPosition;
    maximized: boolean;
  };
  // 其他应用设置
  settings: {
    theme: 'light' | 'dark' | 'auto';
    language: 'zh-CN' | 'en-US';
    autoStartup: boolean;
  };
}

/**
 * 默认配置
 */
const defaultConfig: AppConfig = {
  floatWindow: {
    position: {
      x: 0,
      y: 0,
      width: 400,
      height: 600,
    },
    alwaysOnTop: true,
    opacity: 1.0,
  },
  mainWindow: {
    position: {
      x: 0,
      y: 0,
      width: 1280,
      height: 800,
    },
    maximized: false,
  },
  settings: {
    theme: 'auto',
    language: 'zh-CN',
    autoStartup: false,
  },
};

/**
 * 配置存储实例
 */
class ConfigStore {
  private store: Store<AppConfig>;

  constructor() {
    this.store = new Store<AppConfig>({
      name: 'wechat-desktop-config',
      defaults: defaultConfig,
      // 开发环境下使用当前目录，避免影响生产环境配置
      cwd: process.env.NODE_ENV === 'development' ? process.cwd() : undefined,
    });

    console.log('[ConfigStore] 配置存储已初始化');
    console.log('[ConfigStore] 配置文件路径:', this.store.path);
  }

  // ============= 悬浮窗相关 =============

  /**
   * 获取悬浮窗位置
   */
  getFloatWindowPosition(): WindowPosition {
    return this.store.get('floatWindow.position', defaultConfig.floatWindow.position);
  }

  /**
   * 保存悬浮窗位置
   */
  setFloatWindowPosition(position: WindowPosition): void {
    this.store.set('floatWindow.position', position);
    console.log('[ConfigStore] 保存悬浮窗位置:', position);
  }

  /**
   * 获取悬浮窗置顶状态
   */
  getFloatWindowAlwaysOnTop(): boolean {
    return this.store.get('floatWindow.alwaysOnTop', defaultConfig.floatWindow.alwaysOnTop);
  }

  /**
   * 设置悬浮窗置顶状态
   */
  setFloatWindowAlwaysOnTop(alwaysOnTop: boolean): void {
    this.store.set('floatWindow.alwaysOnTop', alwaysOnTop);
    console.log('[ConfigStore] 保存悬浮窗置顶状态:', alwaysOnTop);
  }

  /**
   * 获取悬浮窗透明度
   */
  getFloatWindowOpacity(): number {
    return this.store.get('floatWindow.opacity', defaultConfig.floatWindow.opacity);
  }

  /**
   * 设置悬浮窗透明度
   */
  setFloatWindowOpacity(opacity: number): void {
    this.store.set('floatWindow.opacity', opacity);
    console.log('[ConfigStore] 保存悬浮窗透明度:', opacity);
  }

  /**
   * 获取完整悬浮窗状态
   */
  getFloatWindowState(): WindowState {
    return this.store.get('floatWindow', defaultConfig.floatWindow);
  }

  /**
   * 设置完整悬浮窗状态
   */
  setFloatWindowState(state: WindowState): void {
    this.store.set('floatWindow', state);
    console.log('[ConfigStore] 保存悬浮窗状态:', state);
  }

  // ============= 主窗口相关 =============

  /**
   * 获取主窗口位置
   */
  getMainWindowPosition(): WindowPosition {
    return this.store.get('mainWindow.position', defaultConfig.mainWindow.position);
  }

  /**
   * 保存主窗口位置
   */
  setMainWindowPosition(position: WindowPosition): void {
    this.store.set('mainWindow.position', position);
    console.log('[ConfigStore] 保存主窗口位置:', position);
  }

  /**
   * 获取主窗口最大化状态
   */
  getMainWindowMaximized(): boolean {
    return this.store.get('mainWindow.maximized', defaultConfig.mainWindow.maximized);
  }

  /**
   * 设置主窗口最大化状态
   */
  setMainWindowMaximized(maximized: boolean): void {
    this.store.set('mainWindow.maximized', maximized);
    console.log('[ConfigStore] 保存主窗口最大化状态:', maximized);
  }

  // ============= 应用设置相关 =============

  /**
   * 获取主题设置
   */
  getTheme(): 'light' | 'dark' | 'auto' {
    return this.store.get('settings.theme', defaultConfig.settings.theme);
  }

  /**
   * 设置主题
   */
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.store.set('settings.theme', theme);
    console.log('[ConfigStore] 保存主题设置:', theme);
  }

  /**
   * 获取语言设置
   */
  getLanguage(): 'zh-CN' | 'en-US' {
    return this.store.get('settings.language', defaultConfig.settings.language);
  }

  /**
   * 设置语言
   */
  setLanguage(language: 'zh-CN' | 'en-US'): void {
    this.store.set('settings.language', language);
    console.log('[ConfigStore] 保存语言设置:', language);
  }

  /**
   * 获取自动启动设置
   */
  getAutoStartup(): boolean {
    return this.store.get('settings.autoStartup', defaultConfig.settings.autoStartup);
  }

  /**
   * 设置自动启动
   */
  setAutoStartup(autoStartup: boolean): void {
    this.store.set('settings.autoStartup', autoStartup);
    console.log('[ConfigStore] 保存自动启动设置:', autoStartup);
  }

  // ============= 工具方法 =============

  /**
   * 重置所有配置为默认值
   */
  reset(): void {
    this.store.clear();
    console.log('[ConfigStore] 配置已重置为默认值');
  }

  /**
   * 获取配置文件路径
   */
  getPath(): string {
    return this.store.path;
  }

  /**
   * 获取所有配置
   */
  getAll(): AppConfig {
    return this.store.store;
  }

  /**
   * 获取配置项
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.store.get(key);
  }

  /**
   * 设置配置项
   */
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.store.set(key, value);
  }
}

// 导出单例实例
export const configStore = new ConfigStore();
