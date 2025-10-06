import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

/**
 * 数据库连接管理模块
 * 使用 better-sqlite3 提供同步API和高性能操作
 */

let db: Database.Database | null = null;

/**
 * 获取数据库文件路径
 * 开发环境：项目根目录/data
 * 生产环境：用户数据目录/data
 */
function getDatabasePath(): string {
  const isDev = process.env.NODE_ENV === 'development';
  const userDataPath = isDev
    ? path.join(process.cwd(), 'data')
    : path.join(app.getPath('userData'), 'data');

  // 确保数据目录存在
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  return path.join(userDataPath, 'articles.db');
}

/**
 * 初始化数据库连接
 * 创建表结构和索引
 */
export function initDatabase(): Database.Database {
  if (db) {
    return db;
  }

  const dbPath = getDatabasePath();
  console.log(`Initializing database at: ${dbPath}`);

  // 创建数据库连接
  db = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  });

  // 启用外键约束
  db.pragma('foreign_keys = ON');

  // 性能优化设置
  db.pragma('journal_mode = WAL'); // Write-Ahead Logging
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = -64000'); // 64MB cache
  db.pragma('temp_store = MEMORY');

  // 读取并执行 schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // 分割SQL语句并执行
  const statements = schema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  db.transaction(() => {
    statements.forEach(stmt => {
      db!.exec(stmt);
    });
  })();

  console.log('Database initialized successfully');
  return db;
}

/**
 * 获取数据库实例
 * 如果未初始化则自动初始化
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

/**
 * 执行事务
 * @param fn 事务函数
 * @returns 事务结果
 */
export function runTransaction<T>(fn: () => T): T {
  const database = getDatabase();
  const transaction = database.transaction(fn);
  return transaction();
}

/**
 * 备份数据库
 * @param backupPath 备份文件路径
 */
export function backupDatabase(backupPath: string): void {
  const database = getDatabase();
  const backup = database.backup(backupPath);

  // better-sqlite3 的 backup 方法是同步的
  (backup as any).step(-1); // 一次性完成备份
  (backup as any).close();

  console.log(`Database backed up to: ${backupPath}`);
}

/**
 * 优化数据库
 * 清理未使用的空间并重建索引
 */
export function optimizeDatabase(): void {
  const database = getDatabase();
  database.exec('VACUUM');
  database.exec('ANALYZE');
  console.log('Database optimized');
}

// 导出类型
export type { Database };
