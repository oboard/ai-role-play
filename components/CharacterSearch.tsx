'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Crown, BookOpen, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/game';
import { useTranslation } from '@/lib/i18n';
import { generateCardImageUrl } from '@/lib/imageUtils';
import { CustomCharacterStorage } from '@/lib/customCharacterStorage';
import characterData from '@/lib/characterData.json';

export default function CharacterSearch() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'historical' | 'fictional' | 'custom'>('all');
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [customCharacters, setCustomCharacters] = useState<Character[]>([]);

  // 从JSON文件中获取角色数据
  const getCharacterData = (id: string): Character => {
    const characterInfo = characterData.characters[id as keyof typeof characterData.characters];
    if (!characterInfo) return null as any;

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

  const PREDEFINED_CHARACTERS: Character[] = Object.keys(characterData.characters).map(id =>
    getCharacterData(id)
  ).filter(Boolean);

  // 合并预定义角色和自定义角色
  const ALL_CHARACTERS: Character[] = useMemo(() => {
    return [...PREDEFINED_CHARACTERS, ...customCharacters];
  }, [customCharacters]);

  // 加载自定义角色
  useEffect(() => {
    const loadCustomCharacters = () => {
      const characters = CustomCharacterStorage.getCustomCharacters();
      setCustomCharacters(characters);
    };

    loadCustomCharacters();
    
    // 监听localStorage变化
    const handleStorageChange = () => {
      loadCustomCharacters();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 异步加载角色图片
  useEffect(() => {
    const loadImages = async () => {
      const urls: Record<string, string> = {};
      for (const character of ALL_CHARACTERS) {
        try {
          urls[character.id] = await generateCardImageUrl(character.name);
        } catch (error) {
          console.warn(`Failed to load image for ${character.name}:`, error);
          // 使用默认图片或空字符串
          urls[character.id] = '';
        }
      }
      setImageUrls(urls);
    };

    if (ALL_CHARACTERS.length > 0) {
      loadImages();
    }
  }, [ALL_CHARACTERS]);

  const filteredCharacters = useMemo(() => {
    return ALL_CHARACTERS.filter(character => {
      const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          character.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 判断是否为自定义角色
      const isCustomCharacter = customCharacters.some(c => c.id === character.id);
      
      let matchesCategory = false;
      if (selectedCategory === 'all') {
        matchesCategory = true;
      } else if (selectedCategory === 'custom') {
        matchesCategory = isCustomCharacter;
      } else {
        matchesCategory = !isCustomCharacter && character.category === selectedCategory;
      }
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, ALL_CHARACTERS, customCharacters]);

  const getCategoryIcon = (category: Character['category']) => {
    switch (category) {
      case 'historical':
        return <Crown className="w-4 h-4" />;
      case 'fictional':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: Character['category']) => {
    switch (category) {
      case 'historical':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'fictional':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('appTitle')}</h1>
        <p className="text-xl text-muted-foreground">{t('selectCharacterToStart')}</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            onClick={() => router.push('/add-character')}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            {t('addCharacter')}
          </Button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
          >
            {t('all')}
          </button>
          <button
            onClick={() => setSelectedCategory('historical')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedCategory === 'historical'
              ? 'bg-amber-600 text-white dark:bg-amber-700'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
          >
            <Crown className="w-4 h-4" />
            {t('historical')}
          </button>
          <button
            onClick={() => setSelectedCategory('fictional')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedCategory === 'fictional'
              ? 'bg-purple-600 text-white dark:bg-purple-700'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            {t('fictional')}
          </button>
          <button
            onClick={() => setSelectedCategory('custom')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedCategory === 'custom'
              ? 'bg-blue-600 text-white dark:bg-blue-700'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
          >
            <User className="w-4 h-4" />
{t('custom')}
          </button>
        </div>
      </div>

      {/* 角色列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCharacters.map((character) => (
          <Card
            key={character.id}
            className="bg-card border-border hover:border-border/80 transition-all duration-300 cursor-pointer hover:shadow-lg overflow-hidden"
            onClick={() => router.push(`/chat/${character.id}`)}
          >
            {/* 角色头像 */}
            <div className="relative h-48 overflow-hidden">
              {imageUrls[character.id] ? (
                <img
                  src={imageUrls[character.id]}
                  alt={character.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    // 如果图片加载失败，显示默认背景
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : (
                // 加载中或无图片时显示默认背景
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  {getCategoryIcon(character.category)}
                </div>
              )}
              {/* 默认背景（错误时显示） */}
              <div className="hidden absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 items-center justify-center">
                {getCategoryIcon(character.category)}
              </div>
              {/* 分类标签 */}
              <div className="absolute top-3 right-3">
                <Badge className={getCategoryColor(character.category)}>
                  <div className="flex items-center gap-1">
                    {getCategoryIcon(character.category)}
                    <span className="text-xs">
                      {character.category === 'historical' ? t('historical') :
                        character.category === 'fictional' ? t('fictional') :
                          character.category}
                    </span>
                  </div>
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-lg">{character.name}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {character.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {character.background}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">{t('noCharactersFound')}</p>
          <p className="text-muted-foreground/60">{t('adjustSearchCriteria')}</p>
        </div>
      )}
    </div>
  );
}