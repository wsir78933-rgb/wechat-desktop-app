# 微信公众号文章抓取模块

## 功能特性

### 核心功能
- ✅ 抓取微信公众号文章内容
- ✅ 提取标题、作者、发布时间、封面图、摘要
- ✅ 支持单篇和批量抓取
- ✅ 自动生成文章摘要（前200字）

### 防护机制
- 🛡️ **随机 User-Agent** - 从6个常用浏览器UA中随机选择
- 🛡️ **请求间隔控制** - 默认2秒间隔，可配置
- 🛡️ **超时和重试** - 默认3次重试，指数退避策略
- 🛡️ **请求超时** - 默认10秒超时，可配置

### 错误处理
- ❌ URL格式验证
- ❌ 网络请求异常捕获
- ❌ HTML解析失败处理
- ❌ 详细的错误信息返回

## 安装依赖

```bash
npm install axios cheerio
npm install -D @types/cheerio
```

## 快速开始

### 基础用法

```typescript
import { scrapeWechatArticle } from './scrapers';

// 抓取单篇文章
const result = await scrapeWechatArticle('https://mp.weixin.qq.com/s/xxxxx');

if (result.success && result.data) {
  console.log('标题:', result.data.title);
  console.log('作者:', result.data.author);
  console.log('摘要:', result.data.summary);
}
```

### 自定义配置

```typescript
import { WechatScraper } from './scrapers';

const scraper = new WechatScraper({
  maxRetries: 5,        // 最大重试次数
  retryDelay: 3000,     // 重试延迟（毫秒）
  timeout: 15000,       // 请求超时（毫秒）
  requestInterval: 3000 // 请求间隔（毫秒）
});

const result = await scraper.scrapeArticle(url);
```

### 批量抓取

```typescript
import { scrapeMultipleWechatArticles } from './scrapers';

const urls = [
  'https://mp.weixin.qq.com/s/article1',
  'https://mp.weixin.qq.com/s/article2',
  'https://mp.weixin.qq.com/s/article3'
];

const results = await scrapeMultipleWechatArticles(urls);

// 统计成功率
const successCount = results.filter(r => r.success).length;
console.log(`成功: ${successCount}/${results.length}`);
```

## API 文档

### ArticleData 接口

```typescript
interface ArticleData {
  title: string;        // 文章标题
  author: string;       // 作者名称
  publishTime: string;  // 发布时间
  coverImage: string;   // 封面图片URL
  summary: string;      // 文章摘要（前200字）
  content?: string;     // 完整文章内容
  url: string;          // 文章URL
}
```

### ScrapeResult 接口

```typescript
interface ScrapeResult {
  success: boolean;     // 是否成功
  data?: ArticleData;   // 文章数据（成功时）
  error?: string;       // 错误信息（失败时）
  retryCount?: number;  // 重试次数
}
```

### WechatScraper 类

#### 构造函数

```typescript
constructor(config?: Partial<ScrapeConfig>)
```

#### 方法

**scrapeArticle(url: string): Promise<ScrapeResult>**
- 抓取单篇文章
- 参数：文章URL
- 返回：抓取结果

**scrapeMultipleArticles(urls: string[]): Promise<ScrapeResult[]>**
- 批量抓取文章
- 参数：文章URL数组
- 返回：抓取结果数组

**updateConfig(config: Partial<ScrapeConfig>): void**
- 更新配置
- 参数：新的配置项

**getConfig(): ScrapeConfig**
- 获取当前配置
- 返回：完整配置对象

### 便捷函数

**scrapeWechatArticle(url: string): Promise<ScrapeResult>**
- 使用默认配置抓取单篇文章

**scrapeMultipleWechatArticles(urls: string[]): Promise<ScrapeResult[]>**
- 使用默认配置批量抓取文章

## 配置说明

```typescript
interface ScrapeConfig {
  maxRetries: number;       // 最大重试次数（默认：3）
  retryDelay: number;       // 重试延迟毫秒（默认：2000）
  timeout: number;          // 请求超时毫秒（默认：10000）
  requestInterval: number;  // 请求间隔毫秒（默认：2000）
}
```

## 防护机制详解

### 1. 随机 User-Agent
从预定义的6个常用浏览器User-Agent中随机选择，模拟真实用户访问：
- Chrome (Windows)
- Chrome (Mac)
- Safari (Mac)
- Firefox (Windows)
- Chrome (Linux)

### 2. 请求间隔控制
- 自动记录上次请求时间
- 确保每次请求间隔至少2秒（可配置）
- 防止频繁请求导致封禁

### 3. 重试机制
- 默认最多重试3次
- 指数退避策略：第n次重试延迟为 `retryDelay * (n + 1)`
- 只在网络错误或超时时重试
- HTTP 4xx错误不重试（如404、403）

### 4. 超时控制
- 默认10秒超时
- 防止请求长时间挂起
- 超时后自动重试

## 错误处理

### 常见错误类型

1. **无效的URL**
   - 错误信息：`无效的微信公众号文章URL`
   - 原因：URL不包含 `mp.weixin.qq.com`

2. **请求失败**
   - 错误信息：`请求失败: [具体原因]`
   - 原因：网络错误、超时、服务器错误等

3. **解析失败**
   - 错误信息：`文章解析失败，可能是HTML结构不匹配`
   - 原因：HTML结构变化、文章被删除等

### 错误处理示例

```typescript
const result = await scrapeWechatArticle(url);

if (!result.success) {
  switch (result.error) {
    case '无效的微信公众号文章URL':
      console.log('请检查URL格式');
      break;
    case '文章解析失败，可能是HTML结构不匹配':
      console.log('文章可能已被删除或HTML结构已变化');
      break;
    default:
      console.log('网络错误或其他问题:', result.error);
  }
}
```

## 使用建议

### 1. 合理设置请求间隔
```typescript
// 生产环境建议使用较长间隔
const scraper = new WechatScraper({
  requestInterval: 3000 // 3秒间隔更安全
});
```

### 2. 批量抓取时注意总时长
```typescript
// 100篇文章 × 3秒间隔 = 约5分钟
const urls = [...]; // 100个URL
const results = await scrapeMultipleWechatArticles(urls);
```

### 3. 处理失败的文章
```typescript
const results = await scrapeMultipleWechatArticles(urls);

// 收集失败的URL
const failedUrls = results
  .map((r, i) => ({ result: r, url: urls[i] }))
  .filter(({ result }) => !result.success)
  .map(({ url }) => url);

// 稍后重试
if (failedUrls.length > 0) {
  console.log('重试失败的文章...');
  const retryResults = await scrapeMultipleWechatArticles(failedUrls);
}
```

### 4. 使用实例而非便捷函数
```typescript
// ❌ 不推荐：每次都创建新实例
for (const url of urls) {
  await scrapeWechatArticle(url); // 内部创建新实例
}

// ✅ 推荐：复用实例
const scraper = new WechatScraper();
for (const url of urls) {
  await scraper.scrapeArticle(url);
}
```

## 注意事项

1. **遵守网站规则**
   - 请遵守微信公众平台的使用条款
   - 不要进行高频率抓取
   - 仅用于个人学习和研究

2. **网络环境**
   - 确保网络连接稳定
   - 某些地区可能需要代理访问

3. **HTML结构变化**
   - 微信可能更新HTML结构
   - 如遇解析失败，请检查选择器是否需要更新

4. **数据隐私**
   - 不要抓取敏感或私密文章
   - 尊重原作者版权

## 故障排查

### 问题1：所有请求都失败
- 检查网络连接
- 验证URL格式
- 检查是否被封禁（尝试手动访问）

### 问题2：解析失败率高
- 微信可能更新了HTML结构
- 检查 `wechat.ts` 中的选择器
- 查看返回的HTML内容

### 问题3：请求超时
- 增加超时时间：`timeout: 20000`
- 检查网络速度
- 尝试减少并发请求

## 更新日志

### v1.0.0 (2025-10-06)
- ✅ 初始版本发布
- ✅ 支持基础文章抓取
- ✅ 实现防护机制
- ✅ 完善错误处理

## 许可证

MIT
