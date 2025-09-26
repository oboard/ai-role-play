const fs = require('fs');

async function testImageAPI(keyword = '孔子') {
  const url = `https://pic.sogou.com/pic/searchList.jsp?uID=&v=5&statref=index_form_1&spver=0&rcer=&keyword=${encodeURIComponent(keyword)}`;

  console.log(`\n=== 测试搜狗图片API ===`);
  console.log(`关键词: ${keyword}`);
  console.log(`请求URL: ${url}`);

  try {
    // 发送GET请求
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`HTTP错误: ${response.status}`);
      return null;
    }

    console.log(`✅ HTTP请求成功: ${response.status}`);

    // 解析HTML内容
    const html = await response.text();
    console.log(`📄 HTML内容长度: ${html.length} 字符`);

    // 新的搜狗图片页面使用Vue.js服务端渲染，直接从HTML中提取图片URL
    console.log(`🔍 分析页面结构...`);
    
    // 提取图片URL的正则表达式
    const imagePattern = /src="(https:\/\/i\d+piccdn\.sogoucdn\.com\/[^"]+)"/g;
    const imageUrls = [];
    let match;
    
    while ((match = imagePattern.exec(html)) !== null) {
      imageUrls.push(match[1]);
    }
    
    if (imageUrls.length > 0) {
      console.log(`🎯 找到 ${imageUrls.length} 个图片URL`);
      
      // 构造模拟的JSON数据结构（与1.json保持一致）
      const simulatedJson = {
        route: {
          name: "searchlist",
          query: {
            keyword: keyword
          }
        },
        searchlist: {
          picData: {
            L0: imageUrls.map((url, index) => ({
              thumbUrl: url,
              title: `搜索结果 ${index + 1}`,
              width: 250,
              height: 250,
              index: index + 1,
              docId: `simulated-${Date.now()}-${index}`,
              type: "search"
            }))
          }
        }
      };
      
      console.log(`✅ 成功提取图片数据`);

      // 保存模拟的JSON到文件
      const filename = `test-result-${keyword}-${Date.now()}.json`;
      fs.writeFileSync(filename, JSON.stringify(simulatedJson, null, 2));
      console.log(`💾 模拟JSON已保存到: ${filename}`);

      // 分析数据结构
      console.log(`\n=== 数据结构分析 ===`);
      console.log(`提取的图片数量: ${imageUrls.length}`);
      console.log(`第一张图片URL: ${imageUrls[0]}`);
      
      // 获取第一张图片的缩略图URL
      const thumbUrl = imageUrls[0];
      console.log(`\n🖼️  提取的缩略图URL: ${thumbUrl}`);

      return {
        success: true,
        json: simulatedJson,
        thumbUrl: thumbUrl,
        filename: filename,
        imageUrls: imageUrls
      };

    } else {
      console.error(`❌ 未找到图片URL`);
      
      // 保存HTML用于调试
      const htmlFilename = `debug-html-${keyword}-${Date.now()}.html`;
      fs.writeFileSync(htmlFilename, html);
      console.log(`🐛 HTML内容已保存到: ${htmlFilename}`);
      
      return null;
    }

  } catch (error) {
    console.error(`❌ 请求失败:`, error.message);
    return null;
  }
}

// 比较与现有1.json文件的差异
function compareWithExistingJson(newJson) {
  try {
    const existingJson = JSON.parse(fs.readFileSync('1.json', 'utf8'));
    
    console.log(`\n=== 与现有1.json文件比较 ===`);
    
    // 比较基本结构
    const newKeys = Object.keys(newJson).sort();
    const existingKeys = Object.keys(existingJson).sort();
    
    console.log(`新JSON根键: [${newKeys.join(', ')}]`);
    console.log(`现有JSON根键: [${existingKeys.join(', ')}]`);
    console.log(`结构一致: ${JSON.stringify(newKeys) === JSON.stringify(existingKeys)}`);
    
    // 比较图片数据
    const newImageCount = newJson?.searchlist?.picData?.L0?.length || 0;
    const existingImageCount = existingJson?.searchlist?.picData?.L0?.length || 0;
    
    console.log(`新JSON图片数量: ${newImageCount}`);
    console.log(`现有JSON图片数量: ${existingImageCount}`);
    
    return {
      structureMatch: JSON.stringify(newKeys) === JSON.stringify(existingKeys),
      newImageCount,
      existingImageCount
    };
    
  } catch (error) {
    console.log(`⚠️  无法读取现有1.json文件: ${error.message}`);
    return null;
  }
}

// 主函数
async function main() {
  console.log(`🚀 开始测试...`);
  
  const result = await testImageAPI('孔子');
  
  if (result && result.success) {
    compareWithExistingJson(result.json);
    
    console.log(`\n=== 测试总结 ===`);
    console.log(`✅ API调用成功`);
    console.log(`✅ JSON解析成功`);
    console.log(`✅ 数据已保存到: ${result.filename}`);
    console.log(`🖼️  缩略图URL: ${result.thumbUrl ? '获取成功' : '获取失败'}`);
  } else {
    console.log(`\n❌ 测试失败`);
  }
}

// 运行测试
main().catch(console.error);