# 抓取器模块架构文档

## 目录结构

```
src/main/scrapers/
├── wechat.ts           # 微信公众号抓取器（核心）
├── types.ts            # 类型定义
├── index.ts            # 模块导出
├── example.ts          # 使用示例
├── test.ts             # 测试脚本
├── README.md           # 使用文档
└── ARCHITECTURE.md     # 架构文档（本文件）
```

## 核心组件

### 1. WechatScraper 类

**职责**：负责抓取微信公众号文章

**核心方法**：
- `scrapeArticle(url)` - 抓取单篇文章
- `scrapeMultipleArticles(urls)` - 批量抓取
- `updateConfig(config)` - 动态更新配置
- `getConfig()` - 获取当前配置

**内部机制**：
- `fetchWithRetry()` - 带重试的HTTP请求
- `ensureRequestInterval()` - 请求间隔控制
- `parseWechatArticle()` - HTML解析

### 2. 数据流程

```
用户输入URL
    ↓
URL验证
    ↓
请求间隔控制
    ↓
HTTP请求（带重试）
    ↓
HTML内容获取
    ↓
内容解析（cheerio）
    ↓
数据提取
    ↓
返回结果
```

### 3. 错误处理流程

```
请求发起
    ↓
成功? → 是 → 返回数据
    ↓
    否
    ↓
可重试? → 是 → 等待 → 重试（最多3次）
    ↓
    否
    ↓
返回错误信息
```

## 技术实现

### 1. 防护机制

#### 随机 User-Agent
```typescript
const USER_AGENTS = [
  'Chrome/Windows',
  'Chrome/Mac',
  'Safari/Mac',
  'Firefox/Windows',
  'Chrome/Linux'
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
```

#### 请求间隔控制
```typescript
private lastRequestTime: number = 0;

private async ensureRequestInterval(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - this.lastRequestTime;

  if (timeSinceLastRequest < this.config.requestInterval) {
    const waitTime = this.config.requestInterval - timeSinceLastRequest;
    await delay(waitTime);
  }

  this.lastRequestTime = Date.now();
}
```

#### 重试机制
```typescript
private async fetchWithRetry(url: string, retryCount: number = 0): Promise<string> {
  try {
    // 发送请求
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    // 重试逻辑
    if (retryCount < this.config.maxRetries) {
      await delay(this.config.retryDelay * (retryCount + 1)); // 指数退避
      return this.fetchWithRetry(url, retryCount + 1);
    }
    throw error;
  }
}
```

### 2. HTML解析

#### 选择器策略
```typescript
// 多重选择器保证兼容性
const title = $('#activity-name').text().trim() ||
              $('h1.rich_media_title').text().trim() ||
              $('h2.rich_media_title').text().trim() ||
              '';
```

#### 数据提取
```typescript
function parseWechatArticle(html: string, url: string): ArticleData | null {
  const $ = cheerio.load(html);

  return {
    title: extractTitle($),
    author: extractAuthor($),
    publishTime: extractPublishTime($),
    coverImage: extractCoverImage($),
    summary: extractSummary($),
    content: extractContent($),
    url
  };
}
```

### 3. 配置管理

#### 默认配置
```typescript
const DEFAULT_CONFIG: ScrapeConfig = {
  maxRetries: 3,        // 最大重试次数
  retryDelay: 2000,     // 重试延迟（毫秒）
  timeout: 10000,       // 请求超时（毫秒）
  requestInterval: 2000 // 请求间隔（毫秒）
};
```

#### 动态更新
```typescript
public updateConfig(config: Partial<ScrapeConfig>): void {
  this.config = { ...this.config, ...config };
}
```

## 性能优化

### 1. 实例复用
```typescript
// ❌ 不推荐：每次创建新实例
urls.forEach(url => scrapeWechatArticle(url));

// ✅ 推荐：复用实例
const scraper = new WechatScraper();
urls.forEach(url => scraper.scrapeArticle(url));
```

### 2. 批量处理
```typescript
// 批量抓取自动管理请求间隔
const results = await scraper.scrapeMultipleArticles(urls);
```

### 3. 指数退避
```typescript
// 重试延迟随次数增加
delay = retryDelay * (retryCount + 1)
// 第1次: 2s, 第2次: 4s, 第3次: 6s
```

## 扩展性设计

### 1. 新增抓取源

可以轻松添加新的抓取器（如知乎、简书等）：

```typescript
// zhihu.ts
export class ZhihuScraper {
  async scrapeArticle(url: string): Promise<ScrapeResult> {
    // 实现知乎文章抓取
  }
}

// index.ts
export { ZhihuScraper } from './zhihu';
```

### 2. 插件化架构

预留插件接口：

```typescript
interface ScraperPlugin {
  name: string;
  beforeRequest?(config: RequestConfig): RequestConfig;
  afterResponse?(data: any): any;
  onError?(error: Error): void;
}

class WechatScraper {
  private plugins: ScraperPlugin[] = [];

  use(plugin: ScraperPlugin): void {
    this.plugins.push(plugin);
  }
}
```

### 3. 自定义解析器

支持自定义HTML解析逻辑：

```typescript
interface Parser {
  parse(html: string, url: string): ArticleData | null;
}

class WechatScraper {
  constructor(
    config?: ScrapeConfig,
    parser?: Parser
  ) {
    this.parser = parser || defaultParser;
  }
}
```

## 安全考虑

### 1. 输入验证
- URL格式验证
- 参数类型检查
- 边界条件处理

### 2. 错误隔离
- try-catch包装
- 错误信息清晰
- 避免敏感信息泄露

### 3. 资源限制
- 超时控制
- 重试次数限制
- 请求频率限制

## 测试策略

### 1. 单元测试
```typescript
describe('WechatScraper', () => {
  test('should validate URL format', () => {
    // 测试URL验证
  });

  test('should retry on failure', () => {
    // 测试重试机制
  });
});
```

### 2. 集成测试
```typescript
describe('Integration Tests', () => {
  test('should scrape real article', async () => {
    // 测试真实抓取
  });
});
```

### 3. 性能测试
```typescript
describe('Performance Tests', () => {
  test('should handle 100 concurrent requests', async () => {
    // 测试并发性能
  });
});
```

## 监控和日志

### 1. 日志级别
- DEBUG: 详细请求信息
- INFO: 抓取成功/失败
- WARN: 重试警告
- ERROR: 严重错误

### 2. 统计信息
```typescript
interface ScrapeStats {
  totalRequests: number;
  successCount: number;
  failedCount: number;
  retryCount: number;
  averageResponseTime: number;
}
```

## 未来改进

### 短期（1-2周）
- [ ] 添加缓存机制
- [ ] 实现代理支持
- [ ] 完善错误分类

### 中期（1-2月）
- [ ] 支持更多公众号平台
- [ ] 添加图片下载功能
- [ ] 实现增量抓取

### 长期（3-6月）
- [ ] 分布式抓取
- [ ] 智能反爬策略
- [ ] AI内容分析

## 依赖关系

```
wechat.ts
  ├── axios (HTTP请求)
  ├── cheerio (HTML解析)
  └── types.ts (类型定义)

index.ts
  ├── wechat.ts
  └── types.ts

example.ts
  └── index.ts

test.ts
  └── wechat.ts
```

## 版本历史

### v1.0.0 (2025-10-06)
- ✅ 初始版本
- ✅ 基础抓取功能
- ✅ 防护机制
- ✅ 错误处理
- ✅ 文档完善

## 贡献指南

1. 遵循TypeScript最佳实践
2. 保持代码简洁易读
3. 添加必要的注释
4. 更新相关文档
5. 编写测试用例

## 许可证

MIT License
