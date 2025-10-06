import { BrowserWindow, screen } from 'electron';
import * as path from 'path';

/**
 * 主窗口配置和管理
 */
export class MainWindow {
  private window: BrowserWindow | null = null;

  /**
   * 获取主窗口实例
   */
  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  /**
   * 创建主窗口
   */
  public create(): BrowserWindow {
    // 获取主显示器信息
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    // 计算居中位置
    const windowWidth = 1400;
    const windowHeight = 900;
    const x = Math.floor((width - windowWidth) / 2);
    const y = Math.floor((height - windowHeight) / 2);

    // 创建主窗口
    this.window = new BrowserWindow({
      width: windowWidth,
      height: windowHeight,
      x: x,
      y: y,
      minWidth: 1000,
      minHeight: 600,
      show: false, // 初始不显示，等待ready-to-show事件
      backgroundColor: '#ffffff',
      title: '公众号桌面应用',
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.js'),
        contextIsolation: true, // 启用上下文隔离
        nodeIntegration: false, // 禁用Node集成
        sandbox: false, // 允许preload脚本访问Node.js API
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
      frame: true, // 显示标准窗口边框
      titleBarStyle: 'default',
      autoHideMenuBar: true, // 自动隐藏菜单栏
    });

    // 设置窗口事件处理
    this.setupEventHandlers();

    // 加载应用页面
    this.loadContent();

    return this.window;
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

    // 窗口最小化时
    this.window.on('minimize', () => {
      console.log('主窗口已最小化');
    });

    // 窗口最大化时
    this.window.on('maximize', () => {
      console.log('主窗口已最大化');
    });

    // 窗口恢复时
    this.window.on('restore', () => {
      console.log('主窗口已恢复');
    });
  }

  /**
   * 加载窗口内容
   */
  private loadContent(): void {
    if (!this.window) return;

    if (process.env.NODE_ENV === 'development') {
      // 开发环境加载开发服务器
      this.window.loadURL('http://localhost:3000');
      // 打开开发者工具
      this.window.webContents.openDevTools();
    } else {
      // 生产环境加载打包后的文件
      this.window.loadFile(path.join(__dirname, '../../renderer/index.html'));
    }
  }

  /**
   * 显示窗口
   */
  public show(): void {
    if (this.window) {
      if (this.window.isMinimized()) {
        this.window.restore();
      }
      this.window.show();
      this.window.focus();
    }
  }

  /**
   * 隐藏窗口
   */
  public hide(): void {
    if (this.window) {
      this.window.hide();
    }
  }

  /**
   * 关闭窗口
   */
  public close(): void {
    if (this.window) {
      this.window.close();
    }
  }

  /**
   * 切换开发者工具
   */
  public toggleDevTools(): void {
    if (this.window) {
      this.window.webContents.toggleDevTools();
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
}

// 导出单例实例
export const mainWindow = new MainWindow();
