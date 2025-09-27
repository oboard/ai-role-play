import { Character } from '@/types/game';

const STORAGE_KEY = 'customCharacters';

export class CustomCharacterStorage {
  /**
   * 获取所有自定义角色
   */
  static getCustomCharacters(): Character[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('获取自定义角色失败:', error);
      return [];
    }
  }

  /**
   * 保存自定义角色
   */
  static saveCustomCharacter(character: Character): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const existingCharacters = this.getCustomCharacters();
      
      // 检查是否已存在相同ID的角色
      const existingIndex = existingCharacters.findIndex(c => c.id === character.id);
      
      if (existingIndex >= 0) {
        // 更新现有角色
        existingCharacters[existingIndex] = character;
      } else {
        // 添加新角色
        existingCharacters.push(character);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingCharacters));
      return true;
    } catch (error) {
      console.error('保存自定义角色失败:', error);
      return false;
    }
  }

  /**
   * 删除自定义角色
   */
  static deleteCustomCharacter(characterId: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const existingCharacters = this.getCustomCharacters();
      const filteredCharacters = existingCharacters.filter(c => c.id !== characterId);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCharacters));
      return true;
    } catch (error) {
      console.error('删除自定义角色失败:', error);
      return false;
    }
  }

  /**
   * 根据ID获取自定义角色
   */
  static getCustomCharacterById(characterId: string): Character | null {
    const characters = this.getCustomCharacters();
    return characters.find(c => c.id === characterId) || null;
  }

  /**
   * 检查角色ID是否已存在
   */
  static isCharacterIdExists(characterId: string): boolean {
    const characters = this.getCustomCharacters();
    return characters.some(c => c.id === characterId);
  }

  /**
   * 生成唯一的角色ID
   */
  static generateUniqueId(baseName: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    const baseId = baseName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    let candidateId = `custom-${baseId}-${timestamp}-${randomSuffix}`;
    
    // 确保ID唯一
    while (this.isCharacterIdExists(candidateId)) {
      const newRandomSuffix = Math.random().toString(36).substr(2, 9);
      candidateId = `custom-${baseId}-${timestamp}-${newRandomSuffix}`;
    }
    
    return candidateId;
  }

  /**
   * 清空所有自定义角色
   */
  static clearAllCustomCharacters(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('清空自定义角色失败:', error);
      return false;
    }
  }

  /**
   * 导出自定义角色数据
   */
  static exportCustomCharacters(): string {
    const characters = this.getCustomCharacters();
    return JSON.stringify(characters, null, 2);
  }

  /**
   * 导入自定义角色数据
   */
  static importCustomCharacters(jsonData: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const characters = JSON.parse(jsonData);
      
      if (!Array.isArray(characters)) {
        throw new Error('导入数据格式错误');
      }
      
      // 验证每个角色的数据结构
      for (const character of characters) {
        if (!character.id || !character.name || !character.description) {
          throw new Error('角色数据不完整');
        }
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
      return true;
    } catch (error) {
      console.error('导入自定义角色失败:', error);
      return false;
    }
  }
}