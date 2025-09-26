import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json({ error: '缺少关键词参数' }, { status: 400 });
  }

  try {
    const imageUrl = await fetchImage(keyword);

    if (imageUrl) {
      return NextResponse.json({ imageUrl });
    } else {
      return NextResponse.json({ error: '未找到图片' }, { status: 404 });
    }
  } catch (error) {
    console.error('图片搜索失败:', error);
    return NextResponse.json({ error: '搜索失败' }, { status: 500 });
  }
}
async function fetchImage(keyword: string): Promise<string | null> {
  const url = `https://pic.sogou.com/pic/searchList.jsp?uID=&v=5&statref=index_form_1&spver=0&rcer=&keyword=${encodeURIComponent(keyword)}`;

  try {
    // 发送GET请求
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return null;
    }

    // 解析HTML内容
    const html = await response.text();

    // 搜狗现在使用Vue.js服务端渲染，直接从HTML中提取图片URL
    const imagePattern = /src="(https:\/\/i\d+piccdn\.sogoucdn\.com\/[^"]+)"/;
    const match = html.match(imagePattern);

    if (match && match[1]) {
      // 返回第一张图片的URL
      return match[1];
    }

    return null;
  } catch (error) {
    console.error('请求失败:', error);
    return null;
  }
}