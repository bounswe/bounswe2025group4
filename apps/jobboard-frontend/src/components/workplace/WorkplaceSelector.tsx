import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Building2, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMyWorkplaces } from '@/services/employer.service';
import type { EmployerWorkplaceBrief } from '@/types/workplace.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface WorkplaceSelectorProps {
  value?: number;
  onChange: (workplaceId: number, workplace: EmployerWorkplaceBrief) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function WorkplaceSelector({
  value,
  onChange,
  error,
  disabled,
  className,
}: WorkplaceSelectorProps) {
  const { t } = useTranslation('common');
  const [workplaces, setWorkplaces] = useState<EmployerWorkplaceBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkplaces = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        const data = await getMyWorkplaces();
        setWorkplaces(data);
      } catch (err) {
        console.error('Error fetching workplaces:', err);
        setFetchError(t('workplace.selector.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkplaces();
  }, [t]);

  const selectedWorkplace = workplaces.find((w) => w.workplace.id === value);

  if (isLoading) {
    return (
      <div className={cn('h-10 bg-muted animate-pulse rounded-md', className)} />
    );
  }

  if (fetchError) {
    return (
      <div className={cn('text-sm text-destructive', className)}>
        {fetchError}
      </div>
    );
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-between font-normal',
              !selectedWorkplace && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            {selectedWorkplace ? (
              <div className="flex items-center gap-2 truncate">
                {selectedWorkplace.workplace.imageUrl ? (
                  <img
                    src={selectedWorkplace.workplace.imageUrl}
                    alt=""
                    className="h-5 w-5 rounded-sm object-cover"
                  />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="truncate">
                  {selectedWorkplace.workplace.companyName}
                </span>
              </div>
            ) : (
              t('workplace.selector.placeholder')
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
          {workplaces.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              {t('workplace.selector.noWorkplaces')}
            </div>
          ) : (
            workplaces.map((item) => (
              <DropdownMenuItem
                key={item.workplace.id}
                onClick={() => onChange(item.workplace.id, item)}
                className="cursor-pointer"
              >
                <div className="flex items-start gap-3 w-full">
                  {item.workplace.imageUrl ? (
                    <img
                      src={item.workplace.imageUrl}
                      alt=""
                      className="h-8 w-8 rounded-sm object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-sm bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {item.workplace.companyName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{item.workplace.sector}</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {item.workplace.location}
                      </span>
                      {item.workplace.overallAvg > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {item.workplace.overallAvg.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}

export { WorkplaceSelector };
export type { WorkplaceSelectorProps };
