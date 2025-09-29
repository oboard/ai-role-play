import { UIMessage } from 'ai';

const CHAT_STORAGE_PREFIX = 'ai-role-play-chat-';

export interface ChatStorage {
  saveMessages: (characterId: string, messages: UIMessage[]) => void;
  loadMessages: (characterId: string) => UIMessage[];
  clearMessages: (characterId: string) => void;
  clearAllMessages: () => void;
}

/**
 * localStorage工具函数
 * 
 * 核心原则：
 * 1. 一个函数只做一件事
 * 2. 没有特殊情况 - 所有角色都用同样的存储逻辑
 * 3. 数据结构简单 - key-value，按角色ID分别存储
 */
export const chatStorage: ChatStorage = {
  saveMessages: (characterId: string, messages: UIMessage[]) => {
    try {
      // 服务端渲染时 localStorage 不存在
      if (typeof window === 'undefined') {
        return;
      }
      
      const key = `${CHAT_STORAGE_PREFIX}${characterId}`;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      // localStorage满了或被禁用 - 静默失败，不破坏用户体验
      console.warn('Failed to save chat messages:', error);
    }
  },

  loadMessages: (characterId: string): UIMessage[] => {
    try {
      // 服务端渲染时 localStorage 不存在
      if (typeof window === 'undefined') {
        return [];
      }
      
      const key = `${CHAT_STORAGE_PREFIX}${characterId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      // JSON解析失败 - 返回空数组，不破坏应用
      console.warn('Failed to load chat messages:', error);
      return [];
    }
  },

  clearMessages: (characterId: string) => {
    try {
      // 服务端渲染时 localStorage 不存在
      if (typeof window === 'undefined') {
        return;
      }
      
      const key = `${CHAT_STORAGE_PREFIX}${characterId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear chat messages:', error);
    }
  },

  clearAllMessages: () => {
    try {
      // 服务端渲染时 localStorage 不存在
      if (typeof window === 'undefined') {
        return;
      }
      
      // 找到所有聊天相关的key并删除
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CHAT_STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear all chat messages:', error);
    }
  }
};