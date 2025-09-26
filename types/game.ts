export interface Voice {
  voice_name: string;
  voice_type: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  background: string;
  avatar?: string;
  category: 'historical' | 'fictional' | 'custom';
  voice?: Voice;
}