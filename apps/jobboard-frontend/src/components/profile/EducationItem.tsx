import { Pencil, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface EducationItemProps {
  education: Education;
  onEdit?: (id: number) => void;
}

export function EducationItem({ education, onEdit }: EducationItemProps) {
  const startYear = new Date(education.startDate).getFullYear();
  const endYear = education.endDate
    ? new Date(education.endDate).getFullYear()
    : 'Present';

  return (
    <div className="bg-muted/30 rounded-lg p-4 group relative">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onEdit?.(education.id)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex gap-3">
        <div className="mt-1">
          <GraduationCap className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">
            {education.degree} in {education.field}, {education.school}
          </h3>
          <p className="text-sm text-muted-foreground">
            {startYear} - {endYear}
          </p>
          {education.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {education.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}