/**
 * 微信公众号抓取器使用示例
 */

import {
  WechatScraper,
  scrapeWechatArticle,
  scrapeMultipleWechatArticles
} from './index';

/**
 * 示例1: 使用便捷函数抓取单篇文章
 */
async function example1() {
  console.log('=== 示例1: 抓取单篇文章 ===');

  const url = 'https://mp.weixin.qq.com/s/xxxxxxxxxxxxx';
  const result = await scrapeWechatArticle(url);

  if (result.success && result.data) {
    console.log('标题:', result.data.title);
    console.log('作者:', result.data.author);
    console.log('发布时间:', result.data.publishTime);
    console.log('摘要:', result.data.summary);
    console.log('重试次数:', result.retryCount);
  } else {
    console.error('抓取失败:', result.error);
  }
}

/**
 * 示例2: 使用类实例并自定义配置
 */
async function example2() {
  console.log('=== 示例2: 自定义配置 ===');

  // 创建抓取器实例，自定义配置
  const scraper = new WechatScraper({
    maxRetries: 5,        // 最大重试次数
    retryDelay: 3000,     // 重试延迟（毫秒）
    timeout: 15000,       // 请求超时（毫秒）
    requestInterval: 3000 // 请求间隔（毫秒）
  });

  const url = 'https://mp.weixin.qq.com/s/xxxxxxxxxxxxx';
  const result = await scraper.scrapeArticle(url);

  if (result.success && result.data) {
    console.log('文章抓取成功!');
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.error('抓取失败:', result.error);
  }
}

/**
 * 示例3: 批量抓取多篇文章
 */
async function example3() {
  console.log('=== 示例3: 批量抓取 ===');

  const urls = [
    'https://mp.weixin.qq.com/s/article1',
    'https://mp.weixin.qq.com/s/article2',
    'https://mp.weixin.qq.com/s/article3'
  ];

  const results = await scrapeMultipleWechatArticles(urls);

  results.forEach((result, index) => {
    if (result.success && result.data) {
      console.log(`文章 ${index + 1}: ${result.data.title}`);
    } else {
      console.error(`文章 ${index + 1} 抓取失败:`, result.error);
    }
  });

  // 统计结果
  const successCount = results.filter(r => r.success).length;
  console.log(`成功: ${successCount}/${results.length}`);
}

/**
 * 示例4: 动态更新配置
 */
async function example4() {
  console.log('=== 示例4: 动态更新配置 ===');

  const scraper = new WechatScraper();

  // 查看当前配置
  console.log('初始配置:', scraper.getConfig());

  // 更新配置
  scraper.updateConfig({
    timeout: 20000,
    requestInterval: 5000
  });

  // 查看更新后的配置
  console.log('更新后配置:', scraper.getConfig());

  const url = 'https://mp.weixin.qq.com/s/xxxxxxxxxxxxx';
  const result = await scraper.scrapeArticle(url);

  console.log('抓取结果:', result.success ? '成功' : '失败');
}

/**
 * 示例5: 错误处理
 */
async function example5() {
  console.log('=== 示例5: 错误处理 ===');

  const scraper = new WechatScraper();

  // 测试无效URL
  const invalidUrl = 'https://example.com/invalid';
  const result1 = await scraper.scrapeArticle(invalidUrl);
  console.log('无效URL结果:', result1.error);

  // 测试空URL
  const result2 = await scraper.scrapeArticle('');
  console.log('空URL结果:', result2.error);

  // 使用try-catch处理异常
  try {
    const result3 = await scraper.scrapeArticle('https://mp.weixin.qq.com/s/test');
    if (!result3.success) {
      throw new Error(result3.error);
    }
  } catch (error: any) {
    console.error('捕获异常:', error.message);
  }
}

/**
 * 运行所有示例
 */
async function runExamples() {
  try {
    // 注意：这些示例需要真实的文章URL才能正常工作
    // await example1();
    // await example2();
    // await example3();
    // await example4();
    // await example5();

    console.log('所有示例执行完成!');
  } catch (error) {
    console.error('示例执行失败:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runExamples();
}

export {
  example1,
  example2,
  example3,
  example4,
  example5,
  runExamples
};
