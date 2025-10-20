interface Activity {
  id: number;
  type: string;
  text: string;
  date: string;
}

interface ActivityTabProps {
  activities: Activity[];
}

export function ActivityTab({ activities }: ActivityTabProps) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="border-l-2 border-primary/20 pl-4 py-2">
          <p className="text-sm">{activity.text}</p>
          <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
        </div>
      ))}
    </div>
  );
}