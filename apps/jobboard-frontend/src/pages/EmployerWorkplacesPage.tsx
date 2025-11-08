/**
 * EmployerWorkplacesPage
 * Lists all workplaces the current employer manages
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Building2 } from 'lucide-react';
import { getMyWorkplaces, getEmployerRequests } from '@/services/employer.service';
import type { EmployerWorkplaceBrief } from '@/types/workplace.types';
import CenteredLoader from '@/components/CenteredLoader';
import CenteredError from '@/components/CenteredError';
import { NewWorkplaceModal } from '@/components/workplace/NewWorkplaceModal';
import { EmployerWorkplaceCard } from '@/components/workplace/EmployerWorkplaceCard';

export default function EmployerWorkplacesPage() {
  const [workplaces, setWorkplaces] = useState<EmployerWorkplaceBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workplacesWithRequests, setWorkplacesWithRequests] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadWorkplaces();
  }, []);

  const loadWorkplaces = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getMyWorkplaces();
      setWorkplaces(data);

      // Fetch employer requests for each workplace
      const workplacesWithPendingRequests = new Set<number>();
      await Promise.all(
        data.map(async ({ workplace }) => {
          try {
            const requests = await getEmployerRequests(workplace.id, { size: 10 });
            // Check if there are any pending requests
            const hasPendingRequests = requests.content.some(
              (req) => req.status === 'PENDING' || req.status.toUpperCase() === 'PENDING'
            );
            if (hasPendingRequests) {
              workplacesWithPendingRequests.add(workplace.id);
            }
          } catch (err) {
            // Silently fail - user might not have permission to view requests
            console.warn(`Failed to fetch requests for workplace ${workplace.id}:`, err);
          }
        })
      );
      setWorkplacesWithRequests(workplacesWithPendingRequests);
    } catch (err) {
      console.error('Failed to load workplaces:', err);
      setError('Failed to load your workplaces');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CenteredLoader />; 
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Workplaces</h1>
            <p className="text-muted-foreground">
              Manage your workplaces and respond to reviews
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" />
              New Workplace
            </Button>
          </div>
        </div>

        {error && (
          <CenteredError
            message="Failed to load your workplaces. Please try again."
            onRetry={loadWorkplaces}
          />
        )}

        {/* Empty State */}
        {!error && workplaces.length === 0 && (
          <Card className="p-8 text-center gap-2">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">No Workplaces Yet</h2>
            <p className="text-muted-foreground mb-2">
              Create your first workplace or request to join an existing one
            </p>
            <div className="flex justify-center">
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4" />
                New Workplace
              </Button>
            </div>
          </Card>
        )}

        {/* Workplaces List */}
        {!error && workplaces.length > 0 && (
          <div className="space-y-4">
            {workplaces.map(({ workplace, role }) => (
              <EmployerWorkplaceCard
                key={workplace.id}
                workplace={workplace}
                role={role}
                hasPendingRequests={workplacesWithRequests.has(workplace.id)}
              />
            ))}

            {/* Shadow Card for New Workplace */}
            <Card
              className="p-12 border-dashed border-2 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer bg-muted/30"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="flex flex-col items-center justify-center text-center py-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Add New Workplace</h3>
                <p className="text-muted-foreground text-sm">
                  Create a new workplace or join an existing one
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* New Workplace Modal */}
        <NewWorkplaceModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </div>
    </div>
  );
}
