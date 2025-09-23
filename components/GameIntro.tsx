'use client';

import { useState } from 'react';
import { Play, Scale, Clock, FileText } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

interface GameIntroProps {
  onStartGame: () => void;
}

export default function GameIntro({ onStartGame }: GameIntroProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">

      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Scale className="text-amber-400" size={80} />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">{t('gameTitle')}</h1>
          <h2 className="text-3xl text-amber-400 mb-6">{t('gameSubtitle')}</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('gameDescription')}
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-semibold text-amber-400 mb-6 text-center">{t('storyTitle')}</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 mb-4">
              {t('storyParagraph1')}
            </p>
            <p className="text-slate-300 mb-4">
              {t('storyParagraph2')}
            </p>
            <p className="text-amber-200">
              <strong>{t('storyParagraph3')}</strong>
            </p>
          </div>
        </div>

        {!showInstructions ? (
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => setShowInstructions(true)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FileText size={20} />
              <span>{t('howToPlay')}</span>
            </button>
            <button
              onClick={onStartGame}
              className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-colors font-semibold"
            >
              <Play size={20} />
              <span>{t('startGame')}</span>
            </button>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg p-8">
            <h3 className="text-2xl font-semibold text-amber-400 mb-6 text-center">{t('howToPlayTitle')}</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="text-amber-400 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-white">{t('timeLimit')}</h4>
                    <p className="text-slate-300">{t('timeLimitDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Scale className="text-amber-400 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-white">{t('talkToCharacters')}</h4>
                    <p className="text-slate-300">{t('talkToCharactersDesc')}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FileText className="text-amber-400 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-white">{t('collectEvidence')}</h4>
                    <p className="text-slate-300">{t('collectEvidenceDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Play className="text-amber-400 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-white">{t('submitCase')}</h4>
                    <p className="text-slate-300">{t('submitCaseDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-6">
              <LanguageSwitcher />
              <button
                onClick={() => setShowInstructions(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {t('back')}
              </button>
              <button
                onClick={onStartGame}
                className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-colors font-semibold"
              >
                <Play size={20} />
                <span>{t('startGame')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}