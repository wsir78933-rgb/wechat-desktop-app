import { BrowserWindow, screen } from 'electron';
import * as path from 'path';

/**
 * 悬浮窗配置和管理
 */
export class FloatWindow {
  private window: BrowserWindow | null = null;
  private isDragging: boolean = false;

  /**
   * 获取悬浮窗实例
   */
  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  /**
   * 创建悬浮窗
   */
  public create(): BrowserWindow {
    // 获取主显示器信息
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    // 计算默认位置（屏幕右侧，垂直居中）
    const windowWidth = 400;
    const windowHeight = 600;
    const x = width - windowWidth - 20; // 距离右边20px
    const y = Math.floor((height - windowHeight) / 2);

    // 创建悬浮窗
    this.window = new BrowserWindow({
      width: windowWidth,
      height: windowHeight,
      x: x,
      y: y,
      minWidth: 300,
      minHeight: 400,
      maxWidth: 600,
      maxHeight: 800,
      show: false, // 初始不显示
      frame: false, // 无边框窗口
      transparent: true, // 透明背景
      alwaysOnTop: true, // 始终置顶
      skipTaskbar: true, // 不在任务栏显示
      resizable: true, // 可调整大小
      hasShadow: true, // 显示阴影
      backgroundColor: '#00000000', // 完全透明背景
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.js'),
        contextIsolation: true, // 启用上下文隔离
        nodeIntegration: false, // 禁用Node集成
        sandbox: false, // 允许preload脚本访问Node.js API
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
      titleBarStyle: 'hidden',
      visualEffectState: 'active',
    });

    // 设置窗口可拖拽
    this.setupDraggable();

    // 设置窗口事件处理
    this.setupEventHandlers();

    // 加载悬浮窗内容
    this.loadContent();

    return this.window;
  }

  /**
   * 设置窗口可拖拽
   */
  private setupDraggable(): void {
    if (!this.window) return;

    // 监听窗口移动事件
    this.window.on('will-move', (event) => {
      this.isDragging = true;
    });

    this.window.on('moved', () => {
      this.isDragging = false;
    });
  }

  /**
   * 设置窗口事件处理
   */
  private setupEventHandlers(): void {
    if (!this.window) return;

    // 窗口准备显示时
    this.window.once('ready-to-show', () => {
      if (this.window) {
        this.window.show();
        this.window.focus();
      }
    });

    // 窗口关闭时
    this.window.on('closed', () => {
      this.window = null;
    });

    // 失去焦点时（可选：自动隐藏或保持显示）
    this.window.on('blur', () => {
      console.log('悬浮窗失去焦点');
      // 可根据需求决定是否自动隐藏
      // this.hide();
    });

    // 窗口大小改变时
    this.window.on('resize', () => {
      const [width, height] = this.window?.getSize() || [0, 0];
      console.log(`悬浮窗大小改变: ${width}x${height}`);
    });

    // 监听鼠标进入和离开
    this.window.on('enter-full-screen', () => {
      console.log('悬浮窗进入全屏');
    });

    this.window.on('leave-full-screen', () => {
      console.log('悬浮窗退出全屏');
    });
  }

  /**
   * 加载窗口内容
   */
  private loadContent(): void {
    if (!this.window) return;

    if (process.env.NODE_ENV === 'development') {
      // 开发环境加载开发服务器（悬浮窗专用页面）
      this.window.loadURL('http://localhost:3000/float');
      // 打开开发者工具
      this.window.webContents.openDevTools({ mode: 'detach' });
    } else {
      // 生产环境加载打包后的文件
      this.window.loadFile(path.join(__dirname, '../../renderer/float.html'));
    }
  }

  /**
   * 显示悬浮窗
   */
  public show(): void {
    if (this.window) {
      this.window.show();
      this.window.focus();
      this.window.setAlwaysOnTop(true, 'floating');
    }
  }

  /**
   * 隐藏悬浮窗
   */
  public hide(): void {
    if (this.window) {
      this.window.hide();
    }
  }

  /**
   * 切换显示/隐藏
   */
  public toggle(): void {
    if (this.window) {
      if (this.window.isVisible()) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  /**
   * 关闭悬浮窗
   */
  public close(): void {
    if (this.window) {
      this.window.close();
    }
  }

  /**
   * 设置窗口位置
   */
  public setPosition(x: number, y: number): void {
    if (this.window) {
      this.window.setPosition(x, y);
    }
  }

  /**
   * 获取窗口位置
   */
  public getPosition(): { x: number; y: number } {
    if (this.window) {
      const [x, y] = this.window.getPosition();
      return { x, y };
    }
    return { x: 0, y: 0 };
  }

  /**
   * 设置窗口大小
   */
  public setSize(width: number, height: number): void {
    if (this.window) {
      this.window.setSize(width, height);
    }
  }

  /**
   * 获取窗口大小
   */
  public getSize(): { width: number; height: number } {
    if (this.window) {
      const [width, height] = this.window.getSize();
      return { width, height };
    }
    return { width: 0, height: 0 };
  }

  /**
   * 设置置顶状态
   */
  public setAlwaysOnTop(flag: boolean): void {
    if (this.window) {
      this.window.setAlwaysOnTop(flag, flag ? 'floating' : 'normal');
    }
  }

  /**
   * 设置不透明度
   */
  public setOpacity(opacity: number): void {
    if (this.window) {
      // opacity范围: 0.0 (完全透明) - 1.0 (完全不透明)
      this.window.setOpacity(Math.max(0, Math.min(1, opacity)));
    }
  }

  /**
   * 发送消息到渲染进程
   */
  public sendMessage(channel: string, data: any): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(channel, data);
    }
  }

  /**
   * 检查窗口是否存在
   */
  public exists(): boolean {
    return this.window !== null && !this.window.isDestroyed();
  }

  /**
   * 检查窗口是否可见
   */
  public isVisible(): boolean {
    return this.window ? this.window.isVisible() : false;
  }

  /**
   * 移动到屏幕中心
   */
  public moveToCenter(): void {
    if (this.window) {
      this.window.center();
    }
  }

  /**
   * 移动到屏幕右侧
   */
  public moveToRight(): void {
    if (this.window) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.workAreaSize;
      const [windowWidth, windowHeight] = this.window.getSize();

      const x = width - windowWidth - 20;
      const y = Math.floor((height - windowHeight) / 2);

      this.window.setPosition(x, y);
    }
  }
}

// 导出单例实例
export const floatWindow = new FloatWindow();
