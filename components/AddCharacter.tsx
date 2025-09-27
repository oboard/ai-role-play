'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Crown, BookOpen, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { Character } from '@/types/game';
import { toast } from '@/hooks/use-toast';
import { CustomCharacterStorage } from '@/lib/customCharacterStorage';

interface FormData {
  name: string;
  description: string;
  personality: string;
  background: string;
  category: 'historical' | 'fictional' | 'custom';
}

export default function AddCharacter() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    personality: '',
    background: '',
    category: 'custom'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: t('characterNameRequired'),
        variant: 'destructive'
      });
      return false;
    }
    if (!formData.description.trim()) {
      toast({
        title: t('characterDescriptionRequired'),
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  const saveCharacter = () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // 生成唯一ID
      const characterId = CustomCharacterStorage.generateUniqueId(formData.name);
      
      // 创建角色对象
      const newCharacter: Character = {
        id: characterId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        personality: formData.personality.trim() || formData.description.trim(),
        background: formData.background.trim() || formData.description.trim(),
        category: formData.category,
        voice: {
          voice_name: 'default',
          voice_type: 'default'
        }
      };

      // 保存角色
      const success = CustomCharacterStorage.saveCustomCharacter(newCharacter);
      
      if (success) {
        toast({
          title: t('characterSaved'),
          description: `${newCharacter.name} ${t('characterSaved')}`,
        });

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        throw new Error('保存失败');
      }
      
    } catch (error) {
      console.error('保存角色失败:', error);
      toast({
        title: '保存失败',
        description: '保存角色时出现错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'historical':
        return <Crown className="w-4 h-4" />;
      case 'fictional':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{t('createNewCharacter')}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('createNewCharacter')}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('appDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 角色名称 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                {t('characterName')} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('characterNamePlaceholder')}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* 角色描述 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                {t('characterDescription')} *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('characterDescriptionPlaceholder')}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
              />
            </div>

            {/* 性格特点 */}
            <div className="space-y-2">
              <Label htmlFor="personality" className="text-foreground">
                {t('characterPersonality')}
              </Label>
              <Textarea
                id="personality"
                value={formData.personality}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                placeholder={t('characterPersonalityPlaceholder')}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
              />
            </div>

            {/* 背景故事 */}
            <div className="space-y-2">
              <Label htmlFor="background" className="text-foreground">
                {t('characterBackground')}
              </Label>
              <Textarea
                id="background"
                value={formData.background}
                onChange={(e) => handleInputChange('background', e.target.value)}
                placeholder={t('characterBackgroundPlaceholder')}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
              />
            </div>

            {/* 角色类别 */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                {t('characterCategory')}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value: 'historical' | 'fictional' | 'custom') => 
                  handleInputChange('category', value)
                }
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon('custom')}
                      {t('custom')}
                    </div>
                  </SelectItem>
                  <SelectItem value="historical">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon('historical')}
                      {t('historical')}
                    </div>
                  </SelectItem>
                  <SelectItem value="fictional">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon('fictional')}
                      {t('fictional')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 保存按钮 */}
            <div className="pt-4">
              <Button
                onClick={saveCharacter}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? t('converting') : t('save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}