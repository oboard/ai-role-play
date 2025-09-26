'use client';

import CharacterSearch from '@/components/CharacterSearch';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useTranslation } from '@/lib/i18n';

export default function Home() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 left-0 right-0 bg-card border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t('appTitle')}</h1>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <CharacterSearch />
      </div>
    </div>
  );
}