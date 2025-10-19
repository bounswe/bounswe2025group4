import { Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AboutSectionProps {
  bio?: string;
  onEdit?: () => void;
}

export function AboutSection({ bio, onEdit }: AboutSectionProps) {
  return (
    <section className="space-y-2 group">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">About</h2>
        <Button
          size="icon-sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      {bio ? (
        <p className="text-muted-foreground leading-relaxed">{bio}</p>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-6 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer transition-colors"
          onClick={onEdit}
        >
          <Plus className="h-4 w-4" />
          <span>Add bio</span>
        </div>
      )}
    </section>
  );
}