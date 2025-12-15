import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { ActivityItem } from './ActivityItem';
import { useUserActivitiesQuery, fetchAllUserActivities } from '@modules/profile/services/activities.service';
import { mapActivitiesToDisplay } from '@modules/profile/utils/activityMapper';
import { enrichActivities } from '@modules/profile/utils/activityEnricher';
import { buildActivityExport, downloadJson } from '@modules/profile/utils/activityExporter';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import type { ActivityDisplay } from '@shared/types/profile.types';

interface ActivityTabProps {
  userId: number;
  isOwner: boolean;
}

export function ActivityTab({ userId, isOwner }: ActivityTabProps) {
  const navigate = useNavigate();
  const [enrichedActivities, setEnrichedActivities] = useState<ActivityDisplay[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data, isLoading, isError } = useUserActivitiesQuery(userId, {
    page: 0,
    size: 20
  });

  // Enrich activities with entity details when data loads
  useEffect(() => {
    if (!data?.content) return;

    const enrichData = async () => {
      setIsEnriching(true);
      const basicActivities = mapActivitiesToDisplay(data.content);

      try {
        const enriched = await enrichActivities(basicActivities);
        setEnrichedActivities(enriched);
      } catch (error) {
        console.warn('Failed to enrich activities, using basic descriptions:', error);
        setEnrichedActivities(basicActivities);
      } finally {
        setIsEnriching(false);
      }
    };

    enrichData();
  }, [data]);

  const handleActivityClick = (activity: ActivityDisplay) => {
    if (activity.clickable && activity.navigationUrl) {
      navigate(activity.navigationUrl);
    }
  };

  const handleDownloadJson = async () => {
    try {
      setIsDownloading(true);

      // Fetch ALL activities (not just current page)
      const allActivities = await fetchAllUserActivities(userId);

      // Build GDPR-compliant export format
      const exportData = buildActivityExport(userId, allActivities);

      // Download as JSON file
      downloadJson(exportData, `activity-data-user-${userId}.json`);

      toast.success(`Downloaded ${allActivities.length} activities`);
    } catch (error) {
      console.error('Failed to download activity data:', error);
      toast.error('Failed to download activity data. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Failed to load activities. Please try again later.</p>
      </div>
    );
  }

  if (enrichedActivities.length === 0 && !isEnriching) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No activities yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="flex justify-end">
          <button
            onClick={handleDownloadJson}
            disabled={isDownloading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download complete activity history as JSON"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isDownloading ? 'Downloading...' : 'Download My Data'}
          </button>
        </div>
      )}

      {isEnriching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading details...
        </div>
      )}

      <div className="space-y-3">
        {enrichedActivities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            onClick={() => handleActivityClick(activity)}
          />
        ))}
      </div>
    </div>
  );
}
