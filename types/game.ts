export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  position: [number, number, number];
  color: string;
  mood?: 'helpful' | 'suspicious' | 'nervous' | 'indifferent';
  personality: string;
  knowledge: string[];
  secrets?: string[];
}

export interface Evidence {
  id: string;
  content: string;
  source: string;
  timestamp: Date;
  importance: 'low' | 'medium' | 'high';
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  characters: Character[];
  atmosphere: string;
}

export interface GameState {
  currentScene: Scene;
  selectedCharacter: Character | null;
  evidenceList: Evidence[];
  timeStarted: Date;
}