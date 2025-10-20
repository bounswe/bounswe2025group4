import { ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from './badge';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { type EthicalTag, type EthicalTagCategory, ETHICAL_TAGS_BY_CATEGORY } from '@/types/job';
import { TAG_TO_KEY_MAP, CATEGORY_TO_KEY_MAP } from '@/constants/ethical-tags';

type MultiSelectDropdownProps = {
  selectedTags: EthicalTag[];
  onTagsChange: (tags: EthicalTag[]) => void;
  placeholder?: string;
  className?: string;
};

export function MultiSelectDropdown({
  selectedTags,
  onTagsChange,
  placeholder,
  className,
}: MultiSelectDropdownProps) {
  const { t } = useTranslation('common');

  const handleToggleTag = (tag: EthicalTag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: EthicalTag) => {
    onTagsChange(selectedTags.filter((t) => t !== tag));
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            aria-label={placeholder || t('ethicalTags.select')}
          >
            <span className="truncate">
              {selectedTags.length > 0
                ? t('ethicalTags.selectedCount', { count: selectedTags.length })
                : placeholder || t('ethicalTags.select')}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1.5">
            <DropdownMenuLabel className="p-0">
              {t('ethicalTags.selectEthicalTags')}
            </DropdownMenuLabel>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-auto p-1 text-xs"
              >
                {t('ethicalTags.clearAll')}
              </Button>
            )}
          </div>
          <DropdownMenuSeparator />
          {(Object.keys(ETHICAL_TAGS_BY_CATEGORY) as EthicalTagCategory[]).map((category) => (
            <div key={category}>
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                {t(`ethicalTags.categories.${CATEGORY_TO_KEY_MAP[category]}`)}
              </DropdownMenuLabel>
              {ETHICAL_TAGS_BY_CATEGORY[category].map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => handleToggleTag(tag)}
                  onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing on select
                >
                  {t(`ethicalTags.tags.${TAG_TO_KEY_MAP[tag]}`)}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              <span className="text-xs">{t(`ethicalTags.tags.${TAG_TO_KEY_MAP[tag]}`)}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label={t('ethicalTags.removeTag', { tag })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
