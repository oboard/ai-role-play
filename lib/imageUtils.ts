/**
 * 图片工具函数
 * 使用免费稳定的网络图片API
 */

export interface ImageOptions {
  size?: number;
  category?: string;
}

/**
 * 字符串转数字哈希
 * @param str 输入字符串
 * @returns 数字哈希值
 */
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
}

/**
 * 生成角色头像URL
 * 使用多个备选方案确保稳定性
 * @param characterName 角色名称
 * @param options 图片选项
 * @returns 头像图片URL
 */
export function generateAvatarUrl(
  characterName: string,
  options: ImageOptions = {}
): string {
  const { size = 256 } = options;
  const hash = stringToHash(characterName);

  // 使用多个稳定的头像API作为备选
  const avatarApis = [
    // DiceBear头像生成器 - 稳定的头像生成
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(characterName)}&size=${size}`,
    // UI Avatars - 基于姓名的头像
    `https://ui-avatars.com/api/?name=${encodeURIComponent(characterName)}&size=${size}&background=random&color=fff`,
    // Boring Avatars - 简洁风格
    `https://source.boringavatars.com/marble/${size}/${encodeURIComponent(characterName)}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`
  ];

  // 根据角色名称哈希选择一个API
  return avatarApis[hash % avatarApis.length];
}

/**
 * 生成角色背景图片URL
 * 使用免费的风景图片API
 * @param characterName 角色名称
 * @param options 图片选项
 * @returns 背景图片URL
 */
export function generateBackgroundUrl(
  characterName: string,
  options: ImageOptions = {}
): string {
  const hash = stringToHash(characterName);

  // 使用多个稳定的国内背景图片API
  const backgroundApis = [
    // 樱花API - 国内稳定
    `https://www.dmoe.cc/random.php`,
    // 夏沫博客 - 国内
    `https://cdn.seovx.com/?mom=302`,
    // 搏天API - 国内
    `https://api.btstu.cn/sjbz/api.php?lx=dongman&format=images`
  ];

  return backgroundApis[hash % backgroundApis.length];
}

/**
 * 生成卡片展示图片URL
 * 为角色卡片生成合适的展示图片
 * @param characterName 角色名称
 * @param options 图片选项
 * @returns 卡片图片URL
 */
export function generateCardImageUrl(
  characterName: string,
  options: ImageOptions = {}
): string {
  const { category = 'portrait' } = options;
  const hash = stringToHash(characterName);

  // 使用多个稳定的国内卡片图片API
  const cardApis = [
    // 樱花API - 国内稳定
    `https://www.dmoe.cc/random.php`,
    // 夏沫博客二次元 - 国内
    `https://cdn.seovx.com/d/?mom=302`,
    // 搏天API动漫 - 国内
    `https://api.btstu.cn/sjbz/api.php?lx=dongman&format=images`
  ];

  return cardApis[hash % cardApis.length];
}