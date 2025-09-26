'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Character } from '@/types/game';
import CharacterSearch from './CharacterSearch';
import ChatInterface from './ChatInterface';
import LanguageSwitcher from './LanguageSwitcher';

export default function RolePlayApp() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleBackToSelection = () => {
    setSelectedCharacter(null);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-3">
        <div className="flex items-center justify-between">
          {selectedCharacter ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToSelection}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  与 {selectedCharacter.name} 对话
                </h1>
                <p className="text-sm text-slate-400">{selectedCharacter.description}</p>
              </div>
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-white">AI 角色扮演</h1>
          )}
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {selectedCharacter ? (
          <ChatInterface character={selectedCharacter} />
        ) : (
          <CharacterSearch onSelectCharacter={handleSelectCharacter} />
        )}
      </div>
    </div>
  );
}