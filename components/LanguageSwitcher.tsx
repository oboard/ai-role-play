'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  const getLanguageLabel = () => {
    switch (language) {
      case 'en':
        return t('english');
      case 'zh':
        return t('chinese');
      default:
        return t('english');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-card border-border text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          <span className="ml-2">{getLanguageLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className="text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <Globe className="mr-2 h-4 w-4" />
          {t('english')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('zh')}
          className="text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <Globe className="mr-2 h-4 w-4" />
          {t('chinese')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}