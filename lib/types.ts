export interface Character {
  id: string;
  name: string;
  avatar: string;
  category: string;
  description: string;
  personality: string;
  background: string;
  speakingStyle: string;
  tags: string[];
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'character';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  characterId: string;
  messages: Message[];
  createdAt: Date;
}