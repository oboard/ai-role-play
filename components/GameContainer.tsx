'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import CharacterPanel from './CharacterPanel';
import ChatInterface from './ChatInterface';
import EvidenceNotebook from './EvidenceNotebook';
import GameIntro from './GameIntro';
import LanguageSwitcher from './LanguageSwitcher';
import { GameState, Character, Evidence } from '@/types/game';
import { useGameData } from '@/hooks/useGameData';
import { useTranslation } from '@/lib/i18n';

export default function GameContainer() {
  const { initialGameState } = useGameData();
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [gameStarted, setGameStarted] = useState(false);

  // Update game state when language changes (only update scene and characters, preserve user progress)
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      currentScene: initialGameState.currentScene
    }));
  }, [initialGameState.currentScene]);

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleCharacterSelect = (character: Character) => {
    setGameState(prev => ({
      ...prev,
      selectedCharacter: character
    }));
  };

  const handleAddEvidence = (evidence: Evidence) => {
    setGameState(prev => ({
      ...prev,
      evidenceList: [...prev.evidenceList, { ...evidence, id: Date.now().toString() }]
    }));
  };

  if (!gameStarted) {
    return (
      <>
        <GameIntro onStartGame={handleStartGame} />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Timer Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-400">{t('gameTitle')}</h1>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${timeRemaining < 120 ? 'bg-red-900 text-red-200' : 'bg-slate-700 text-slate-200'
            }`}>
            <Clock size={20} />
            <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4">
        {/* Character Panel - Left */}
        <div className="col-span-3">
          <CharacterPanel
            characters={gameState.currentScene.characters}
            selectedCharacter={gameState.selectedCharacter}
            onCharacterSelect={handleCharacterSelect}
          />
        </div>

        {/* Chat Interface - Center */}
        <div className="col-span-6">
          <ChatInterface
            selectedCharacter={gameState.selectedCharacter}
          />
        </div>

        {/* Evidence Notebook - Right */}
        <div className="col-span-3">
          <EvidenceNotebook evidence={gameState.evidenceList} />
        </div>
      </div>
    </div>
  );
}