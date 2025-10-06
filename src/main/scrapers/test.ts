/**
 * 微信公众号抓取器测试脚本
 * 用于快速验证抓取器功能
 */

import { WechatScraper } from './wechat';

/**
 * 测试URL（请替换为真实的文章URL）
 */
const TEST_URLS = [
  // 'https://mp.weixin.qq.com/s/xxxxxxxxxxxxx',
  // 添加更多测试URL
];

/**
 * 运行测试
 */
async function runTest() {
  console.log('='.repeat(60));
  console.log('微信公众号抓取器测试');
  console.log('='.repeat(60));

  // 创建抓取器实例
  const scraper = new WechatScraper({
    maxRetries: 3,
    retryDelay: 2000,
    timeout: 10000,
    requestInterval: 2000
  });

  console.log('\n配置信息:');
  console.log(JSON.stringify(scraper.getConfig(), null, 2));

  // 测试无效URL
  console.log('\n[测试1] 测试无效URL...');
  const invalidResult = await scraper.scrapeArticle('https://example.com/invalid');
  console.log('结果:', invalidResult.success ? '成功' : '失败');
  console.log('错误:', invalidResult.error);

  // 测试空URL
  console.log('\n[测试2] 测试空URL...');
  const emptyResult = await scraper.scrapeArticle('');
  console.log('结果:', emptyResult.success ? '成功' : '失败');
  console.log('错误:', emptyResult.error);

  // 测试真实URL（如果提供）
  if (TEST_URLS.length > 0) {
    console.log('\n[测试3] 测试真实URL...');
    for (let i = 0; i < TEST_URLS.length; i++) {
      const url = TEST_URLS[i];
      console.log(`\n抓取文章 ${i + 1}/${TEST_URLS.length}:`);
      console.log('URL:', url);

      const result = await scraper.scrapeArticle(url);

      if (result.success && result.data) {
        console.log('✅ 抓取成功!');
        console.log('标题:', result.data.title);
        console.log('作者:', result.data.author);
        console.log('发布时间:', result.data.publishTime);
        console.log('封面图:', result.data.coverImage ? '有' : '无');
        console.log('摘要长度:', result.data.summary.length);
        console.log('摘要预览:', result.data.summary.substring(0, 50) + '...');
        console.log('重试次数:', result.retryCount);
      } else {
        console.log('❌ 抓取失败!');
        console.log('错误:', result.error);
        console.log('重试次数:', result.retryCount);
      }
    }
  } else {
    console.log('\n[测试3] 跳过（未提供测试URL）');
    console.log('请在 TEST_URLS 中添加真实的微信公众号文章URL进行测试');
  }

  console.log('\n' + '='.repeat(60));
  console.log('测试完成!');
  console.log('='.repeat(60));
}

// 运行测试
if (require.main === module) {
  runTest().catch(error => {
    console.error('测试失败:', error);
    process.exit(1);
  });
}

export { runTest };
