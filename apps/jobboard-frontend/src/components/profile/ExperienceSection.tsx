import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExperienceItem } from './ExperienceItem';

interface Experience {
  id: number;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

interface ExperienceSectionProps {
  experiences: Experience[];
  onAdd?: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function ExperienceSection({
  experiences,
  onAdd,
  onEdit,
  onDelete,
}: ExperienceSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Experience</h2>
        <Button size="sm" variant="ghost" className="gap-2" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      {experiences.length > 0 ? (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <ExperienceItem key={exp.id} experience={exp} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-6 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer transition-colors"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          <span>Add experience</span>
        </div>
      )}
    </section>
  );
}