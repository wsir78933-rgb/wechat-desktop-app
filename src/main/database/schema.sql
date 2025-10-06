-- ========================================
-- 公众号文章管理系统数据库结构
-- 使用 SQLite 3 with FTS5 全文搜索
-- ========================================

-- 文章表
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,                    -- 文章标题
  author TEXT,                            -- 作者
  content TEXT NOT NULL,                  -- 文章内容（Markdown格式）
  html_content TEXT,                      -- HTML格式内容（用于显示）
  summary TEXT,                           -- 摘要
  cover_image TEXT,                       -- 封面图片URL
  source_url TEXT,                        -- 原文链接
  public_account TEXT,                    -- 公众号名称
  publish_time INTEGER,                   -- 发布时间（Unix时间戳）
  read_count INTEGER DEFAULT 0,           -- 阅读次数
  like_count INTEGER DEFAULT 0,           -- 点赞数
  is_favorite INTEGER DEFAULT 0,          -- 是否收藏（0-否，1-是）
  is_archived INTEGER DEFAULT 0,          -- 是否归档（0-否，1-是）
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),  -- 创建时间
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))   -- 更新时间
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,              -- 标签名称（唯一）
  color TEXT DEFAULT '#1890ff',           -- 标签颜色
  description TEXT,                       -- 标签描述
  article_count INTEGER DEFAULT 0,        -- 关联文章数量
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 文章-标签关联表（多对多）
CREATE TABLE IF NOT EXISTS article_tags (
  article_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- FTS5 全文搜索虚拟表
-- 索引文章标题、作者、内容和摘要
CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
  title,
  author,
  content,
  summary,
  content='articles',
  content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'  -- Unicode分词器，支持中文
);

-- ========================================
-- 索引优化
-- ========================================

-- 文章表索引
CREATE INDEX IF NOT EXISTS idx_articles_title ON articles(title);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author);
CREATE INDEX IF NOT EXISTS idx_articles_public_account ON articles(public_account);
CREATE INDEX IF NOT EXISTS idx_articles_publish_time ON articles(publish_time DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_favorite ON articles(is_favorite);
CREATE INDEX IF NOT EXISTS idx_articles_is_archived ON articles(is_archived);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- 标签表索引
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- 关联表索引
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);

-- ========================================
-- 触发器：自动更新 updated_at
-- ========================================

CREATE TRIGGER IF NOT EXISTS update_articles_timestamp
AFTER UPDATE ON articles
BEGIN
  UPDATE articles SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- ========================================
-- 触发器：同步 FTS5 索引
-- ========================================

-- 插入文章时自动添加到FTS索引
CREATE TRIGGER IF NOT EXISTS articles_ai
AFTER INSERT ON articles
BEGIN
  INSERT INTO articles_fts(rowid, title, author, content, summary)
  VALUES (NEW.id, NEW.title, NEW.author, NEW.content, NEW.summary);
END;

-- 删除文章时自动从FTS索引删除
CREATE TRIGGER IF NOT EXISTS articles_ad
AFTER DELETE ON articles
BEGIN
  DELETE FROM articles_fts WHERE rowid = OLD.id;
END;

-- 更新文章时自动更新FTS索引
CREATE TRIGGER IF NOT EXISTS articles_au
AFTER UPDATE ON articles
BEGIN
  UPDATE articles_fts
  SET title = NEW.title,
      author = NEW.author,
      content = NEW.content,
      summary = NEW.summary
  WHERE rowid = NEW.id;
END;

-- ========================================
-- 触发器：自动更新标签的文章计数
-- ========================================

-- 添加关联时增加计数
CREATE TRIGGER IF NOT EXISTS increment_tag_count
AFTER INSERT ON article_tags
BEGIN
  UPDATE tags SET article_count = article_count + 1 WHERE id = NEW.tag_id;
END;

-- 删除关联时减少计数
CREATE TRIGGER IF NOT EXISTS decrement_tag_count
AFTER DELETE ON article_tags
BEGIN
  UPDATE tags SET article_count = article_count - 1 WHERE id = OLD.tag_id;
END;

-- ========================================
-- 初始化数据（可选）
-- ========================================

-- 插入默认标签
INSERT OR IGNORE INTO tags (name, color, description) VALUES
  ('技术', '#1890ff', '技术相关文章'),
  ('产品', '#52c41a', '产品相关文章'),
  ('设计', '#fa8c16', '设计相关文章'),
  ('管理', '#722ed1', '管理相关文章'),
  ('其他', '#8c8c8c', '其他分类文章');
