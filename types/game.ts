export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  background: string;
  avatar?: string;
  category: 'historical' | 'fictional' | 'custom';
}