import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EducationItem } from './EducationItem';

interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface EducationSectionProps {
  educations: Education[];
  onAdd?: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function EducationSection({
  educations,
  onAdd,
  onEdit,
  onDelete,
}: EducationSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Education</h2>
        <Button size="sm" variant="ghost" className="gap-2" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      {educations.length > 0 ? (
        <div className="space-y-3">
          {educations.map((edu) => (
            <EducationItem key={edu.id} education={edu} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-6 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer transition-colors"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          <span>Add education</span>
        </div>
      )}
    </section>
  );
}