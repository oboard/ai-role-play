/**
 * 图片工具函数
 * 基于搜狗图片搜索的简单实现
 */

export interface ImageOptions {
  size?: number;
  category?: string;
}

/**
 * 搜索图片并返回URL
 * @param keyword 搜索关键词
 * @returns 图片URL
 */
export async function searchImageByKeyword(keyword: string): Promise<string | null> {
  try {
    // 调用我们的API路由
    const response = await fetch(`/api/image?keyword=${encodeURIComponent(keyword)}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.imageUrl || null;
    }
    
    return null;
  } catch (error) {
    console.warn('图片搜索失败:', error);
    return null;
  }
}



/**
 * 生成角色头像URL
 * @param characterName 角色名称
 * @param options 图片选项
 * @returns 头像图片URL
 */
export async function generateAvatarUrl(
  characterName: string,
  options: ImageOptions = {}
): Promise<string> {
  const imageUrl = await searchImageByKeyword(characterName);
  return imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(characterName)}&size=256`;
}

/**
 * 生成角色背景图片URL
 * @param characterName 角色名称
 * @param options 图片选项
 * @returns 背景图片URL
 */
export async function generateBackgroundUrl(
  characterName: string,
  options: ImageOptions = {}
): Promise<string> {
  const imageUrl = await searchImageByKeyword(characterName);
  return imageUrl || 'https://www.dmoe.cc/random.php';
}

/**
 * 生成卡片展示图片URL
 * @param characterName 角色名称
 * @param options 图片选项
 * @returns 卡片图片URL
 */
export async function generateCardImageUrl(
  characterName: string,
  options: ImageOptions = {}
): Promise<string> {
  const imageUrl = await searchImageByKeyword(characterName);
  return imageUrl || 'https://www.dmoe.cc/random.php';
}