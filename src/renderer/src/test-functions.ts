/**
 * 测试功能集合
 * 用于测试应用的各个功能
 */

// 测试手动添加文章
export async function testManualAdd() {
  console.log('🧪 开始测试手动添加文章功能...\n');

  const testArticle = {
    title: '测试文章 - ' + new Date().toLocaleString('zh-CN'),
    author: '自动测试系统',
    url: 'https://test.example.com/' + Date.now(),
    content: `这是一篇自动生成的测试文章。

测试时间：${new Date().toLocaleString('zh-CN')}

测试内容包括：
1. 标题输入
2. 作者信息
3. URL链接
4. 文章内容
5. 标签系统

这是测试的最后一段。`,
    tags: ['测试', '自动化', 'Electron'],
    publishDate: new Date().toISOString()
  };

  try {
    console.log('📝 创建测试文章:', testArticle.title);
    const result = await window.api.createArticle(testArticle);
    console.log('✅ 文章创建成功！', result);

    // 刷新文章列表
    console.log('\n📚 获取最新文章列表...');
    const articles = await window.api.getAllArticles(5, 0);
    console.log(`共获取 ${articles.length} 篇文章:`);
    articles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title}`);
    });

    return result;
  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

// 测试文章采集（从公众号URL）
export async function testScrapeArticle(url?: string) {
  console.log('🧪 开始测试文章采集功能...\n');

  // 使用测试URL或用户提供的URL
  const testUrl = url || 'https://mp.weixin.qq.com/s/JtRkJLvdvpMTYNxE8p7PCA';

  const params = {
    url: testUrl,
    accountName: '测试公众号',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天前
    endDate: new Date().toISOString(),
    maxArticles: 1
  };

  try {
    console.log('🔗 采集URL:', testUrl);
    console.log('⏳ 正在采集文章，请稍候...');

    const result = await window.api.scrapeArticles(params);

    if (result.success) {
      console.log('✅ 采集成功！');
      console.log(`  共采集 ${result.total} 篇文章`);
      result.articles.forEach((article, index) => {
        console.log(`\n文章 ${index + 1}:`);
        console.log(`  标题: ${article.title}`);
        console.log(`  作者: ${article.author}`);
        console.log(`  发布时间: ${article.publishDate}`);
        console.log(`  内容长度: ${article.content?.length || 0} 字符`);
      });
    } else {
      console.error('❌ 采集失败:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

// 测试悬浮窗功能
export async function testFloatWindow() {
  console.log('🧪 开始测试悬浮窗功能...\n');

  try {
    // 切换悬浮窗显示/隐藏
    console.log('🪟 切换悬浮窗...');
    await window.api.window.toggleFloat();
    console.log('✅ 悬浮窗切换成功');

    // 获取悬浮窗位置
    const position = await window.api.window.getPosition('float');
    console.log('📍 悬浮窗位置:', position);

    // 获取悬浮窗大小
    const size = await window.api.window.getSize('float');
    console.log('📐 悬浮窗大小:', size);

    return { position, size };
  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

// 测试搜索功能
export async function testSearch(keyword: string = '测试') {
  console.log('🧪 开始测试搜索功能...\n');

  const searchParams = {
    keyword,
    limit: 10,
    offset: 0
  };

  try {
    console.log('🔍 搜索关键词:', keyword);
    const result = await window.api.searchArticles(searchParams);

    console.log(`✅ 搜索完成！找到 ${result.total} 篇相关文章`);
    console.log(`显示前 ${result.articles.length} 篇:`);

    result.articles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title} - ${article.author}`);
    });

    // 测试搜索建议
    console.log('\n💡 获取搜索建议...');
    const suggestions = await window.api.getSearchSuggestions(keyword);
    console.log('搜索建议:', suggestions);

    return result;
  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

// 运行所有测试
export async function runAllTests() {
  console.log('🚀 开始运行所有测试...\n');
  console.log('=' .repeat(50));

  const results = {
    manualAdd: false,
    scrape: false,
    floatWindow: false,
    search: false
  };

  try {
    // 1. 测试手动添加
    console.log('\n1️⃣ 测试手动添加文章');
    console.log('-'.repeat(30));
    await testManualAdd();
    results.manualAdd = true;
    console.log('✅ 手动添加测试通过\n');
  } catch (e) {
    console.error('❌ 手动添加测试失败\n');
  }

  try {
    // 2. 测试搜索功能
    console.log('\n2️⃣ 测试搜索功能');
    console.log('-'.repeat(30));
    await testSearch();
    results.search = true;
    console.log('✅ 搜索功能测试通过\n');
  } catch (e) {
    console.error('❌ 搜索功能测试失败\n');
  }

  try {
    // 3. 测试悬浮窗
    console.log('\n3️⃣ 测试悬浮窗功能');
    console.log('-'.repeat(30));
    await testFloatWindow();
    results.floatWindow = true;
    console.log('✅ 悬浮窗测试通过\n');
  } catch (e) {
    console.error('❌ 悬浮窗测试失败\n');
  }

  try {
    // 4. 测试文章采集（可能会失败，因为需要真实的公众号URL）
    console.log('\n4️⃣ 测试文章采集功能');
    console.log('-'.repeat(30));
    console.log('⚠️ 注意：采集测试可能因为网络或URL问题失败');
    await testScrapeArticle();
    results.scrape = true;
    console.log('✅ 采集功能测试通过\n');
  } catch (e) {
    console.error('❌ 采集功能测试失败（这可能是正常的）\n');
  }

  // 测试总结
  console.log('=' .repeat(50));
  console.log('📊 测试结果总结:');
  console.log(`  ✅ 手动添加: ${results.manualAdd ? '通过' : '失败'}`);
  console.log(`  ✅ 搜索功能: ${results.search ? '通过' : '失败'}`);
  console.log(`  ✅ 悬浮窗: ${results.floatWindow ? '通过' : '失败'}`);
  console.log(`  ${results.scrape ? '✅' : '⚠️'} 文章采集: ${results.scrape ? '通过' : '需要真实URL'}`);

  const passedCount = Object.values(results).filter(r => r).length;
  console.log(`\n总计: ${passedCount}/4 测试通过`);

  return results;
}

// 将测试函数绑定到window对象，方便在控制台调用
if (typeof window !== 'undefined') {
  (window as any).testFunctions = {
    testManualAdd,
    testScrapeArticle,
    testFloatWindow,
    testSearch,
    runAllTests
  };

  console.log(`
📚 测试函数已加载！可以在控制台运行以下命令：

  testFunctions.testManualAdd()     - 测试手动添加文章
  testFunctions.testSearch()        - 测试搜索功能
  testFunctions.testFloatWindow()   - 测试悬浮窗功能
  testFunctions.testScrapeArticle() - 测试文章采集
  testFunctions.runAllTests()       - 运行所有测试

💡 提示：按 F12 打开开发者工具控制台
  `);
}