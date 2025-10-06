# 快速开始指南

## 5分钟上手微信公众号抓取器

### 第一步：安装依赖

```bash
cd /home/wcp/项目集合/公众号桌面应用
npm install
```

所需依赖（已在 package.json 中）：
- `axios` - HTTP请求库
- `cheerio` - HTML解析库
- `@types/cheerio` - TypeScript类型定义

### 第二步：快速测试

#### 方式1：使用便捷函数（最简单）

```typescript
import { scrapeWechatArticle } from './src/main/scrapers';

// 抓取单篇文章
const url = 'https://mp.weixin.qq.com/s/xxxxxxxxxxxxx';
const result = await scrapeWechatArticle(url);

if (result.success && result.data) {
  console.log('标题:', result.data.title);
  console.log('作者:', result.data.author);
  console.log('摘要:', result.data.summary);
} else {
  console.log('失败:', result.error);
}
```

#### 方式2：使用类实例（推荐）

```typescript
import { WechatScraper } from './src/main/scrapers';

// 创建抓取器
const scraper = new WechatScraper();

// 抓取文章
const result = await scraper.scrapeArticle(url);
```

#### 方式3：运行测试脚本

```bash
# 运行内置测试
npm run scraper:example

# 或直接运行测试文件
ts-node src/main/scrapers/test.ts
```

### 第三步：实战示例

#### 示例1：抓取单篇文章

```typescript
import { WechatScraper } from './src/main/scrapers';

async function demo1() {
  const scraper = new WechatScraper();
  const url = 'https://mp.weixin.qq.com/s/xxxxxxxxxxxxx';

  const result = await scraper.scrapeArticle(url);

  if (result.success && result.data) {
    const { title, author, publishTime, summary } = result.data;
    console.log(`《${title}》 - ${author} (${publishTime})`);
    console.log(summary);
  }
}

demo1();
```

#### 示例2：批量抓取多篇文章

```typescript
import { WechatScraper } from './src/main/scrapers';

async function demo2() {
  const scraper = new WechatScraper();

  const urls = [
    'https://mp.weixin.qq.com/s/article1',
    'https://mp.weixin.qq.com/s/article2',
    'https://mp.weixin.qq.com/s/article3'
  ];

  const results = await scraper.scrapeMultipleArticles(urls);

  results.forEach((result, index) => {
    if (result.success && result.data) {
      console.log(`✅ 文章${index + 1}: ${result.data.title}`);
    } else {
      console.log(`❌ 文章${index + 1}: ${result.error}`);
    }
  });
}

demo2();
```

#### 示例3：自定义配置

```typescript
import { WechatScraper } from './src/main/scrapers';

async function demo3() {
  // 自定义配置：更长的超时和间隔
  const scraper = new WechatScraper({
    maxRetries: 5,        // 重试5次
    retryDelay: 3000,     // 重试间隔3秒
    timeout: 15000,       // 超时15秒
    requestInterval: 3000 // 请求间隔3秒
  });

  const result = await scraper.scrapeArticle(url);
}

demo3();
```

### 第四步：处理结果

#### 成功响应

```typescript
{
  success: true,
  data: {
    title: "文章标题",
    author: "作者名称",
    publishTime: "2025-10-06",
    coverImage: "https://...",
    summary: "文章摘要前200字...",
    content: "完整文章内容",
    url: "https://mp.weixin.qq.com/s/xxxxx"
  },
  retryCount: 0
}
```

#### 失败响应

```typescript
{
  success: false,
  error: "请求失败: timeout of 10000ms exceeded",
  retryCount: 3
}
```

### 第五步：错误处理

```typescript
import { WechatScraper } from './src/main/scrapers';

async function robustDemo() {
  const scraper = new WechatScraper();

  try {
    const result = await scraper.scrapeArticle(url);

    if (!result.success) {
      // 根据错误类型处理
      if (result.error?.includes('无效的')) {
        console.error('URL格式错误');
      } else if (result.error?.includes('timeout')) {
        console.error('请求超时，请检查网络');
      } else {
        console.error('未知错误:', result.error);
      }
      return;
    }

    // 处理成功结果
    console.log(result.data);

  } catch (error) {
    console.error('严重错误:', error);
  }
}
```

## 常见问题

### Q1: 如何获取微信公众号文章URL？

**A:** 在手机微信中打开文章，点击右上角"..."，选择"复制链接"

### Q2: 抓取失败怎么办？

**A:** 检查以下几点：
1. URL格式是否正确（必须包含 `mp.weixin.qq.com`）
2. 网络连接是否正常
3. 文章是否已被删除
4. 是否被限流（增加请求间隔）

### Q3: 如何提高抓取成功率？

**A:**
```typescript
const scraper = new WechatScraper({
  maxRetries: 5,        // 增加重试次数
  timeout: 20000,       // 增加超时时间
  requestInterval: 5000 // 增加请求间隔
});
```

### Q4: 可以抓取哪些内容？

**A:** 目前支持：
- ✅ 标题
- ✅ 作者
- ✅ 发布时间
- ✅ 封面图
- ✅ 文章摘要（前200字）
- ✅ 完整内容

### Q5: 如何保存抓取的文章？

**A:**
```typescript
import * as fs from 'fs';

const result = await scraper.scrapeArticle(url);

if (result.success && result.data) {
  // 保存为JSON
  fs.writeFileSync(
    'article.json',
    JSON.stringify(result.data, null, 2)
  );

  // 或保存为文本
  fs.writeFileSync(
    'article.txt',
    `标题: ${result.data.title}\n作者: ${result.data.author}\n\n${result.data.content}`
  );
}
```

## 性能优化建议

### 1. 复用实例

```typescript
// ❌ 错误：每次创建新实例
for (const url of urls) {
  await scrapeWechatArticle(url);
}

// ✅ 正确：复用实例
const scraper = new WechatScraper();
for (const url of urls) {
  await scraper.scrapeArticle(url);
}
```

### 2. 使用批量接口

```typescript
// ❌ 不推荐：循环调用
for (const url of urls) {
  await scraper.scrapeArticle(url);
}

// ✅ 推荐：批量调用
const results = await scraper.scrapeMultipleArticles(urls);
```

### 3. 合理设置间隔

```typescript
// 开发测试：快速
const devScraper = new WechatScraper({
  requestInterval: 1000 // 1秒
});

// 生产环境：保守
const prodScraper = new WechatScraper({
  requestInterval: 5000 // 5秒
});
```

## 下一步

1. 📖 阅读 [README.md](./README.md) - 完整API文档
2. 🏗️ 阅读 [ARCHITECTURE.md](./ARCHITECTURE.md) - 架构设计
3. 💡 查看 [example.ts](./example.ts) - 更多示例
4. 🧪 运行 [test.ts](./test.ts) - 测试脚本

## 技术支持

- 遇到问题？查看 README.md 的故障排查部分
- 需要新功能？参考 ARCHITECTURE.md 的扩展性设计
- 想要贡献？遵循 ARCHITECTURE.md 的贡献指南

## 许可证

MIT License

---

**祝你使用愉快！**🎉
