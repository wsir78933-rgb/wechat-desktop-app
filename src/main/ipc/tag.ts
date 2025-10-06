/**
 * 标签相关IPC处理器
 * 处理标签的增删改查和文章-标签关联操作
 */

import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../types/ipc';
import type { Tag, TagOperationResult } from '../../types/ipc';

// 导入数据库操作模块 (待实现)
// import { TagDatabase } from '../database/tag';

/**
 * 注册标签相关的IPC处理器
 */
export function registerTagHandlers() {
  // ============= 获取所有标签 =============
  ipcMain.handle(IPC_CHANNELS.TAG_GET_ALL, async (): Promise<Tag[]> => {
    console.log('[IPC] 获取所有标签');

    try {
      // TODO: 从数据库查询
      // const db = new TagDatabase();
      // return await db.getAll();

      // 模拟数据
      return [
        { id: 1, name: '技术', color: '#3b82f6', count: 45, createdAt: new Date().toISOString() },
        { id: 2, name: 'AI', color: '#8b5cf6', count: 32, createdAt: new Date().toISOString() },
        { id: 3, name: '产品', color: '#10b981', count: 28, createdAt: new Date().toISOString() },
        { id: 4, name: '设计', color: '#f59e0b', count: 19, createdAt: new Date().toISOString() },
        { id: 5, name: '运营', color: '#ef4444', count: 15, createdAt: new Date().toISOString() },
      ];
    } catch (error) {
      console.error('[IPC] 获取标签列表失败:', error);
      return [];
    }
  });

  // ============= 创建标签 =============
  ipcMain.handle(
    IPC_CHANNELS.TAG_CREATE,
    async (_event, name: string, color?: string): Promise<TagOperationResult> => {
      console.log(`[IPC] 创建标签: name=${name}, color=${color}`);

      try {
        // 验证输入
        if (!name || name.trim().length === 0) {
          return {
            success: false,
            message: '标签名称不能为空',
          };
        }

        if (name.length > 20) {
          return {
            success: false,
            message: '标签名称不能超过20个字符',
          };
        }

        // TODO: 检查重复并保存到数据库
        // const db = new TagDatabase();
        // const exists = await db.findByName(name);
        // if (exists) {
        //   return { success: false, message: '标签已存在' };
        // }
        // const tag = await db.create(name, color);

        const tag: Tag = {
          id: Date.now(),
          name: name.trim(),
          color: color || '#6b7280',
          count: 0,
          createdAt: new Date().toISOString(),
        };

        return {
          success: true,
          message: '标签创建成功',
          tag,
        };
      } catch (error) {
        console.error('[IPC] 创建标签失败:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : '创建失败',
        };
      }
    }
  );

  // ============= 更新标签 =============
  ipcMain.handle(
    IPC_CHANNELS.TAG_UPDATE,
    async (_event, id: number, name: string, color?: string): Promise<TagOperationResult> => {
      console.log(`[IPC] 更新标签: id=${id}, name=${name}, color=${color}`);

      try {
        // 验证输入
        if (!name || name.trim().length === 0) {
          return {
            success: false,
            message: '标签名称不能为空',
          };
        }

        if (name.length > 20) {
          return {
            success: false,
            message: '标签名称不能超过20个字符',
          };
        }

        // TODO: 更新数据库
        // const db = new TagDatabase();
        // const exists = await db.findByName(name);
        // if (exists && exists.id !== id) {
        //   return { success: false, message: '标签名称已被使用' };
        // }
        // const tag = await db.update(id, name, color);

        const tag: Tag = {
          id,
          name: name.trim(),
          color: color || '#6b7280',
          createdAt: new Date().toISOString(),
        };

        return {
          success: true,
          message: '标签更新成功',
          tag,
        };
      } catch (error) {
        console.error('[IPC] 更新标签失败:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : '更新失败',
        };
      }
    }
  );

  // ============= 删除标签 =============
  ipcMain.handle(IPC_CHANNELS.TAG_DELETE, async (_event, id: number): Promise<boolean> => {
    console.log(`[IPC] 删除标签: id=${id}`);

    try {
      // TODO: 从数据库删除
      // const db = new TagDatabase();
      // await db.delete(id); // 应该级联删除文章-标签关联

      return true;
    } catch (error) {
      console.error('[IPC] 删除标签失败:', error);
      return false;
    }
  });

  // ============= 为文章添加标签 =============
  ipcMain.handle(
    IPC_CHANNELS.TAG_ADD_TO_ARTICLE,
    async (_event, articleId: number, tagId: number): Promise<boolean> => {
      console.log(`[IPC] 为文章添加标签: articleId=${articleId}, tagId=${tagId}`);

      try {
        // TODO: 创建文章-标签关联
        // const db = new TagDatabase();
        // await db.addToArticle(articleId, tagId);

        return true;
      } catch (error) {
        console.error('[IPC] 添加标签失败:', error);
        return false;
      }
    }
  );

  // ============= 从文章移除标签 =============
  ipcMain.handle(
    IPC_CHANNELS.TAG_REMOVE_FROM_ARTICLE,
    async (_event, articleId: number, tagId: number): Promise<boolean> => {
      console.log(`[IPC] 从文章移除标签: articleId=${articleId}, tagId=${tagId}`);

      try {
        // TODO: 删除文章-标签关联
        // const db = new TagDatabase();
        // await db.removeFromArticle(articleId, tagId);

        return true;
      } catch (error) {
        console.error('[IPC] 移除标签失败:', error);
        return false;
      }
    }
  );

  console.log('[IPC] 标签处理器注册完成');
}

/**
 * 清理标签相关的IPC处理器
 */
export function unregisterTagHandlers() {
  ipcMain.removeHandler(IPC_CHANNELS.TAG_GET_ALL);
  ipcMain.removeHandler(IPC_CHANNELS.TAG_CREATE);
  ipcMain.removeHandler(IPC_CHANNELS.TAG_UPDATE);
  ipcMain.removeHandler(IPC_CHANNELS.TAG_DELETE);
  ipcMain.removeHandler(IPC_CHANNELS.TAG_ADD_TO_ARTICLE);
  ipcMain.removeHandler(IPC_CHANNELS.TAG_REMOVE_FROM_ARTICLE);

  console.log('[IPC] 标签处理器已清理');
}
