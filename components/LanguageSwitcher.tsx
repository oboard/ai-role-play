'use client';

import { Globe } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className="top-4 right-4 z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-2">
        <div className="flex items-center space-x-2">
          <Globe size={16} className="text-slate-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
            className="bg-slate-700 text-white text-sm border border-slate-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="en">{t('english')}</option>
            <option value="zh">{t('chinese')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}