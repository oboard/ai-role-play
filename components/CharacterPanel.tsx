'use client';

import { Character } from '@/types/game';
import { Users, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface CharacterPanelProps {
  characters: Character[];
  activeCharacters: Set<string>;
  onToggleCharacterChat: (characterId: string) => void;
}

export default function CharacterPanel({ characters, activeCharacters, onToggleCharacterChat }: CharacterPanelProps) {
  const { t } = useTranslation();
  
  return (
    <div className="h-full bg-slate-800 rounded-lg border border-slate-600 flex flex-col">
      <div className="h-12 bg-slate-700 flex items-center px-4 border-b border-slate-600">
        <Users size={20} className="text-amber-400 mr-2" />
        <span className="text-amber-400 font-semibold">{t('characters')}</span>
      </div>
      
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {characters.map((character) => {
          const isActive = activeCharacters.has(character.id);
          return (
            <button
              key={character.id}
              onClick={() => onToggleCharacterChat(character.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                isActive
                  ? 'border-amber-400 bg-amber-900/20 shadow-lg shadow-amber-400/20'
                  : 'border-slate-600 bg-slate-700 hover:border-slate-500 hover:bg-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{character.name}</h3>
                {isActive && (
                  <MessageSquare size={16} className="text-amber-400" />
                )}
              </div>
              <p className="text-sm text-slate-300 mb-2">{character.role}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{character.description}</p>
              
              {character.mood && (
                <div className="mt-2 inline-block">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    character.mood === 'suspicious' ? 'bg-red-900/30 text-red-300' :
                    character.mood === 'helpful' ? 'bg-green-900/30 text-green-300' :
                    character.mood === 'nervous' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-slate-600 text-slate-300'
                  }`}>
                    {character.mood}
                  </span>
                </div>
              )}
            </button>
          );
        })}
        
        {characters.length === 0 && (
          <div className="text-center text-slate-400 py-8">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No characters in this scene</p>
          </div>
        )}
      </div>
    </div>
  );
}