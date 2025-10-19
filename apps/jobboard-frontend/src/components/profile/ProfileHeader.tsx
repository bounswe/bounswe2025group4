import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Experience {
  id: number;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  imageUrl?: string;
  createdAt: string;
  experiences: Experience[];
  postsCount?: number;
  badgesCount?: number;
  onEditImage?: () => void;
}

export function ProfileHeader({
  firstName,
  lastName,
  imageUrl,
  createdAt,
  experiences,
  postsCount = 42,
  badgesCount = 5,
  onEditImage,
}: ProfileHeaderProps) {
  const joinYear = new Date(createdAt).getFullYear();
  const currentJob = experiences.find((exp) => !exp.endDate);

  return (
    <div className="flex items-start gap-6 pb-6">
      <div className="relative group">
        <Avatar className="h-32 w-32">
          <AvatarImage src={imageUrl} alt={`${firstName} ${lastName}`} />
          <AvatarFallback className="text-2xl">
            {firstName[0]}
            {lastName[0]}
          </AvatarFallback>
        </Avatar>
        <Button
          size="icon-sm"
          variant="secondary"
          className="absolute bottom-0 right-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onEditImage}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {firstName} {lastName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentJob
                ? `${currentJob.position} at ${currentJob.company}`
                : 'Open to opportunities'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Joined in {joinYear}
            </p>
          </div>

          <div className="flex gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">{postsCount}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{badgesCount}</div>
              <div className="text-sm text-muted-foreground">Badges</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}