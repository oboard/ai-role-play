'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Character } from '@/types/game';
import ChatInterface from '@/components/ChatInterface';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import characterData from '@/lib/characterData.json';
import { useTranslation } from '@/lib/i18n';
import { generateAvatarUrl, generateBackgroundUrl } from '@/lib/imageUtils';
import { ttsService } from '@/lib/ttsService';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useTranslation();
  const characterId = params.characterId as string;

  // 从JSON文件中获取角色数据
  const getCharacterData = (id: string): Character | null => {
    const characterInfo = characterData.characters[id as keyof typeof characterData.characters];
    if (!characterInfo) return null;

    return {
      id: characterInfo.id,
      name: characterInfo.name[language] || characterInfo.name.en,
      description: characterInfo.description[language] || characterInfo.description.en,
      personality: characterInfo.personality[language] || characterInfo.personality.en,
      background: characterInfo.background[language] || characterInfo.background.en,
      category: characterInfo.category as 'historical' | 'fictional' | 'custom',
      voice: characterInfo.voice
    };
  };

  const character = getCharacterData(characterId);

  // 设置角色的默认语音
  useEffect(() => {
    if (character?.voice) {
      ttsService.setVoice(character.voice.voice_type);
    }
  }, [character]);

  if (!character) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('characterNotFound')}</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            {t('backToCharacterSelection')}
          </button>
        </div>
      </div>
    );
  }

  const handleBackToSelection = () => {
    router.push('/');
  };

  return (
    <div
      className="h-screen flex flex-col bg-background relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${generateBackgroundUrl(character.name)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* 背景遮罩层 */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>

      {/* Header */}
      <div className="bg-card/90 backdrop-blur-sm border-b border-border px-6 py-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToSelection}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            {/* 角色头像 */}
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border">
              <img
                src={generateAvatarUrl(character.name)}
                alt={character.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 如果图片加载失败，显示默认头像
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 items-center justify-center">
                <span className="text-foreground font-bold text-lg">
                  {character.name.charAt(0)}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {t('chatWithCharacter', { name: character.name })}
              </h1>
              <p className="text-sm text-muted-foreground">{character.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-1 relative z-10">
        <ChatInterface character={character} />
      </div>
    </div>
  );
}