export const translations = {
  en: {
    // App Title
    appTitle: "AI Role Play",
    appDescription: "Chat with historical figures and fictional characters using AI",
    
    // Character Categories
    historical: "Historical",
    fictional: "Fictional",
    all: "All",
    
    // Search
    searchPlaceholder: "Search character name or description...",
    noCharactersFound: "No characters found",
    adjustSearchCriteria: "Try adjusting your search criteria",
    
    // Chat
    chatWith: "Chat with",
    backToSelection: "Back to Selection",
    
    // Buttons and Actions
    back: "Back",
    cancel: "Cancel",
    close: "Close",
    
    // Language
    language: "Language",
    english: "English",
    chinese: "中文"
  },
  
  zh: {
    // App Title
    appTitle: "AI 角色扮演",
    appDescription: "与历史人物和虚构角色进行AI对话",
    
    // Character Categories
    historical: "历史人物",
    fictional: "虚构角色",
    all: "全部",
    
    // Search
    searchPlaceholder: "搜索角色名称或描述...",
    noCharactersFound: "没有找到匹配的角色",
    adjustSearchCriteria: "尝试调整搜索条件",
    
    // Chat
    chatWith: "与",
    backToSelection: "返回选择",
    
    // Buttons and Actions
    back: "返回",
    cancel: "取消",
    close: "关闭",
    
    // Language
    language: "语言",
    english: "English",
    chinese: "中文"
  }
} as const;

export type TranslationKey = keyof typeof translations.en;
export type Language = keyof typeof translations;