/**
 * 跨平台兼容性工具
 * 处理 Windows、macOS、Linux 平台差异
 */

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 获取当前平台
 */
export function getPlatform(): 'win32' | 'darwin' | 'linux' {
  return process.platform as 'win32' | 'darwin' | 'linux';
}

/**
 * 是否为 Windows 平台
 */
export function isWindows(): boolean {
  return process.platform === 'win32';
}

/**
 * 是否为 macOS 平台
 */
export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

/**
 * 是否为 Linux 平台
 */
export function isLinux(): boolean {
  return process.platform === 'linux';
}

/**
 * 是否在 WSL 环境中运行
 */
export function isWSL(): boolean {
  if (process.platform !== 'linux') {
    return false;
  }

  try {
    const osRelease = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    return osRelease.includes('microsoft') || osRelease.includes('wsl');
  } catch {
    return false;
  }
}

/**
 * 获取跨平台的用户数据目录
 * 避免 WSL 和 Windows 之间的路径冲突
 */
export function getUserDataPath(): string {
  // 在开发环境下，使用项目目录避免权限问题
  if (process.env.NODE_ENV === 'development') {
    return path.join(process.cwd(), '.dev-data');
  }

  // 生产环境使用 Electron 的用户数据目录
  return app.getPath('userData');
}

/**
 * 获取跨平台的配置文件路径
 */
export function getConfigPath(): string {
  const userDataPath = getUserDataPath();
  return path.join(userDataPath, 'config');
}

/**
 * 获取跨平台的数据库路径
 */
export function getDatabasePath(): string {
  const userDataPath = getUserDataPath();
  return path.join(userDataPath, 'database');
}

/**
 * 获取跨平台的日志路径
 */
export function getLogPath(): string {
  const userDataPath = getUserDataPath();
  return path.join(userDataPath, 'logs');
}

/**
 * 获取跨平台的临时文件路径
 */
export function getTempPath(): string {
  return app.getPath('temp');
}

/**
 * 规范化路径分隔符
 * 将所有路径分隔符转换为当前平台的格式
 */
export function normalizePath(filePath: string): string {
  // Windows 使用反斜杠，其他平台使用正斜杠
  if (isWindows()) {
    return filePath.replace(/\//g, '\\');
  } else {
    return filePath.replace(/\\/g, '/');
  }
}

/**
 * 将路径转换为 POSIX 格式（正斜杠）
 * 用于 URL 和网络请求
 */
export function toPosixPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * 将路径转换为 Windows 格式（反斜杠）
 */
export function toWindowsPath(filePath: string): string {
  return filePath.replace(/\//g, '\\');
}

/**
 * 确保目录存在，如果不存在则创建
 */
export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 获取跨平台的执行文件扩展名
 */
export function getExecutableExtension(): string {
  return isWindows() ? '.exe' : '';
}

/**
 * 获取跨平台的换行符
 */
export function getLineEnding(): string {
  return isWindows() ? '\r\n' : '\n';
}

/**
 * 修复 Windows 路径问题
 * 处理 UNC 路径、长路径等 Windows 特定问题
 */
export function fixWindowsPath(filePath: string): string {
  if (!isWindows()) {
    return filePath;
  }

  // 处理长路径（超过 260 字符）
  if (!filePath.startsWith('\\\\?\\') && filePath.length > 240) {
    return '\\\\?\\' + path.resolve(filePath);
  }

  return filePath;
}

/**
 * 获取安全的文件名
 * 移除或替换不同平台不支持的字符
 */
export function getSafeFileName(fileName: string): string {
  // Windows 不支持的字符
  const invalidChars = /[<>:"/\\|?*]/g;

  // 替换无效字符为下划线
  let safeName = fileName.replace(invalidChars, '_');

  // 移除控制字符
  safeName = safeName.replace(/[\x00-\x1f\x80-\x9f]/g, '');

  // 移除尾部的点和空格（Windows 不允许）
  safeName = safeName.replace(/[.\s]+$/, '');

  // 限制文件名长度（Windows 限制为 255 字符）
  if (safeName.length > 200) {
    const ext = path.extname(safeName);
    const base = path.basename(safeName, ext);
    safeName = base.substring(0, 200 - ext.length) + ext;
  }

  return safeName || 'unnamed';
}

/**
 * 检查文件权限
 * 在 Windows 上权限检查可能不准确
 */
export function checkFilePermission(filePath: string, mode: number): boolean {
  try {
    fs.accessSync(filePath, mode);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取跨平台的默认字体
 */
export function getDefaultFont(): string {
  if (isWindows()) {
    return 'Microsoft YaHei, Segoe UI, Arial, sans-serif';
  } else if (isMacOS()) {
    return '-apple-system, BlinkMacSystemFont, Helvetica Neue, PingFang SC, sans-serif';
  } else {
    return 'Noto Sans CJK SC, Ubuntu, DejaVu Sans, sans-serif';
  }
}

/**
 * 处理跨平台的文件 URL
 */
export function filePathToUrl(filePath: string): string {
  // 确保使用正斜杠
  const posixPath = toPosixPath(filePath);

  // Windows 需要额外的斜杠
  if (isWindows() && !posixPath.startsWith('file:///')) {
    return 'file:///' + posixPath;
  }

  if (!posixPath.startsWith('file://')) {
    return 'file://' + posixPath;
  }

  return posixPath;
}

/**
 * URL 转文件路径
 */
export function urlToFilePath(url: string): string {
  if (!url.startsWith('file://')) {
    return url;
  }

  let filePath = url.replace('file://', '');

  // Windows 路径处理
  if (isWindows()) {
    filePath = filePath.replace(/^\/+/, '');
    filePath = toWindowsPath(filePath);
  }

  return filePath;
}

/**
 * 初始化必要的目录
 */
export function initializeDirectories(): void {
  const directories = [
    getUserDataPath(),
    getConfigPath(),
    getDatabasePath(),
    getLogPath(),
  ];

  directories.forEach(dir => {
    ensureDirectory(dir);
  });

  console.log('[Platform] 目录初始化完成');
  console.log('[Platform] 用户数据路径:', getUserDataPath());
  console.log('[Platform] 配置路径:', getConfigPath());
  console.log('[Platform] 数据库路径:', getDatabasePath());
  console.log('[Platform] 日志路径:', getLogPath());
}

/**
 * 获取平台相关的信息
 */
export function getPlatformInfo() {
  return {
    platform: getPlatform(),
    isWindows: isWindows(),
    isMacOS: isMacOS(),
    isLinux: isLinux(),
    isWSL: isWSL(),
    arch: process.arch,
    nodeVersion: process.version,
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    userDataPath: getUserDataPath(),
  };
}

// 导出平台常量
export const PLATFORM = {
  IS_WINDOWS: isWindows(),
  IS_MAC: isMacOS(),
  IS_LINUX: isLinux(),
  IS_WSL: isWSL(),
  LINE_ENDING: getLineEnding(),
  PATH_SEPARATOR: path.sep,
  EXECUTABLE_EXT: getExecutableExtension(),
} as const;