import React from 'react';
import { Filter as FilterIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useFilters } from '@/hooks/useFilters';

type MobileJobFiltersProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onResetFilters?: () => void;
  filtersContent: React.ReactNode;
};

export function MobileJobFilters({
  isOpen,
  onOpenChange,
  onResetFilters,
  filtersContent,
}: MobileJobFiltersProps) {
  const { resetFilters } = useFilters();
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="gap-2 lg:hidden"
            aria-label={t('mobileFilters.open')}
          >
            <FilterIcon className="size-4" aria-hidden />
          {t('mobileFilters.title')}
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isRtl ? 'right' : 'left'}
        className="w-full max-w-md overflow-y-auto"
      >
        <SheetHeader className="px-4 pt-6">
          <SheetTitle className="text-xl font-semibold">
            {t('mobileFilters.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-6">
          {filtersContent}
        </div>
        <SheetFooter className="px-4 pb-6">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                resetFilters();
                onResetFilters?.();
              }}
            >
              {t('mobileFilters.reset')}
            </Button>
            <Button
              type="button"
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => onOpenChange(false)}
            >
              {t('mobileFilters.apply')}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
