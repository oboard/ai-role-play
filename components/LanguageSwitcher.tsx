'use client';

import { Globe } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className="bg-card border border-border rounded-lg p-2">
      <div className="flex items-center space-x-2">
        <Globe size={16} className="text-muted-foreground" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
          className="bg-background text-foreground text-sm border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="en">{t('english')}</option>
          <option value="zh">{t('chinese')}</option>
        </select>
      </div>
    </div>
  );
}