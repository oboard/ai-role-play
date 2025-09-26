/**
 * 图片生成工具函数
 * 基于 Pollinations AI API 生成角色头像和背景图片
 */

export interface ImageOptions {
  width?: number;
  height?: number;
  enhance?: boolean;
  private?: boolean;
}

/**
 * 生成角色头像URL
 * @param characterName 角色名称
 * @param options 图片选项
 * @returns 头像图片URL
 */
export function generateAvatarUrl(
  characterName: string,
  options: ImageOptions = {}
): string {
  const {
    width = 256,
    height = 256,
    enhance = true,
    private: isPrivate = true
  } = options;

  const prompt = encodeURIComponent(`${characterName} portrait, professional headshot, high quality`);
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    enhance: enhance.toString(),
    private: isPrivate.toString()
  });

  return `https://image.pollinations.ai/prompt/${prompt}?${params.toString()}`;
}

/**
 * 生成角色背景图片URL
 * @param characterName 角色名称
 * @param options 图片选项
 * @returns 背景图片URL
 */
export function generateBackgroundUrl(
  characterName: string,
  options: ImageOptions = {}
): string {
  const {
    width = 1920,
    height = 1080,
    enhance = true,
    private: isPrivate = true
  } = options;

  const prompt = encodeURIComponent(`${characterName} themed background, atmospheric, cinematic lighting`);
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    enhance: enhance.toString(),
    private: isPrivate.toString()
  });

  return `https://image.pollinations.ai/prompt/${prompt}?${params.toString()}`;
}

/**
 * 生成卡片展示图片URL
 * @param characterName 角色名称
 * @param options 图片选项
 * @returns 卡片图片URL
 */
export function generateCardImageUrl(
  characterName: string,
  options: ImageOptions = {}
): string {
  const {
    width = 400,
    height = 300,
    enhance = true,
    private: isPrivate = false
  } = options;

  const prompt = encodeURIComponent(`${characterName}`);
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    enhance: enhance.toString(),
    private: isPrivate.toString()
  });

  return `https://image.pollinations.ai/prompt/${prompt}?${params.toString()}`;
}