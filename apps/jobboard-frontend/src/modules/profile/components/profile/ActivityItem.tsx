import * as LucideIcons from 'lucide-react';
import type { ActivityDisplay } from '@shared/types/profile.types';

interface ActivityItemProps {
  activity: ActivityDisplay;
  onClick: () => void;
}

export function ActivityItem({ activity, onClick }: ActivityItemProps) {
  const Icon = (LucideIcons as any)[activity.icon] || LucideIcons.Circle;

  const baseClasses = "border-l-2 border-primary/20 pl-4 py-2.5 rounded-r transition-colors";
  const interactiveClasses = activity.clickable
    ? "cursor-pointer hover:bg-muted/50 hover:border-primary/40"
    : "";

  return (
    <div
      className={`${baseClasses} ${interactiveClasses}`}
      onClick={activity.clickable ? onClick : undefined}
      role={activity.clickable ? 'button' : undefined}
      tabIndex={activity.clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (activity.clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
          <Icon className="w-4 h-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">{activity.text}</p>
          <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
        </div>

        {activity.clickable && (
          <LucideIcons.ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
        )}
      </div>
    </div>
  );
}
