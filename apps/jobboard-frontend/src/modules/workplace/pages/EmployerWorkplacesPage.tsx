/**
 * EmployerWorkplacesPage
 * Lists all workplaces the current employer manages
 */

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { Plus, Building2, ListChecks, Loader2 } from 'lucide-react';
import { getMyWorkplaces, getEmployerRequests, getMyEmployerRequests } from '@modules/employer/services/employer.service';
import type { EmployerWorkplaceBrief, EmployerRequestResponse } from '@shared/types/workplace.types';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import CenteredError from '@shared/components/common/CenteredError';
import { NewWorkplaceModal } from '@/modules/workplace/components/NewWorkplaceModal';
import { JoinWorkplaceModal } from '@/modules/workplace/components/JoinWorkplaceModal';
import { CreateWorkplaceModal } from '@/modules/workplace/components/CreateWorkplaceModal';
import { EmployerWorkplaceCard } from '@/modules/workplace/components/EmployerWorkplaceCard';
import { getErrorMessage } from '@shared/utils/error-handler';

export default function EmployerWorkplacesPage() {
  const { t } = useTranslation('common');
  const [workplaces, setWorkplaces] = useState<EmployerWorkplaceBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewWorkplaceModalOpen, setIsNewWorkplaceModalOpen] = useState(false);
  const [isCreateWorkplaceModalOpen, setIsCreateWorkplaceModalOpen] = useState(false);
  const [isJoinWorkplaceModalOpen, setIsJoinWorkplaceModalOpen] = useState(false);
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const [myRequests, setMyRequests] = useState<EmployerRequestResponse[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [workplacesWithRequests, setWorkplacesWithRequests] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadWorkplaces();
  }, []);

  useEffect(() => {
    if (isApplicationsModalOpen) {
      loadMyRequests();
    }
  }, [isApplicationsModalOpen]);

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
      setError(getErrorMessage(err, t('employer.workplaces.loadError')));
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      setRequestsError(null);
      setRequestsLoading(true);
      const response = await getMyEmployerRequests({ size: 50 });
      setMyRequests(response.content);
    } catch (err) {
      console.error('Failed to load employer requests:', err);
      setRequestsError(
        getErrorMessage(err, t('employer.workplaces.applicationsModal.loadError'))
      );
    } finally {
      setRequestsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const normalized = status?.toUpperCase();
    if (normalized === 'PENDING') return t('employer.workplaces.status.pending');
    if (normalized === 'APPROVED' || normalized === 'ACCEPTED')
      return t('employer.workplaces.status.accepted');
    if (normalized === 'REJECTED') return t('employer.workplaces.status.rejected');
    return status || t('employer.workplaces.status.unknown');
  };

  const getStatusClasses = (status: string) => {
    const normalized = status?.toUpperCase();
    if (normalized === 'PENDING') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (normalized === 'APPROVED' || normalized === 'ACCEPTED') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (normalized === 'REJECTED') return 'bg-rose-100 text-rose-800 border-rose-200';
    return 'bg-secondary text-secondary-foreground';
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
            <h1 className="text-3xl font-bold mb-2">{t('employer.workplaces.title')}</h1>
            <p className="text-muted-foreground">
              {t('employer.workplaces.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsApplicationsModalOpen(true)} className="gap-2">
              <ListChecks className="h-4 w-4" />
              {t('employer.workplaces.viewApplications')}
            </Button>
            <Button onClick={() => setIsNewWorkplaceModalOpen(true)}>
              <Plus className="h-4 w-4" />
              {t('employer.workplaces.newWorkplace')}
            </Button>
          </div>
        </div>

        {error && (
          <CenteredError
            message={error ?? t('employer.workplaces.loadError')}
            onRetry={loadWorkplaces}
          />
        )}

        {/* Empty State */}
        {!error && workplaces.length === 0 && (
          <Card className="p-8 text-center gap-2">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">{t('employer.workplaces.empty.title')}</h2>
            <p className="text-muted-foreground mb-2">
              {t('employer.workplaces.empty.description')}
            </p>
            <div className="flex justify-center">
              <Button onClick={() => setIsNewWorkplaceModalOpen(true)}>
                <Plus className="h-4 w-4" />
                {t('employer.workplaces.newWorkplace')}
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
              onClick={() => setIsNewWorkplaceModalOpen(true)}
            >
              <div className="flex flex-col items-center justify-center text-center py-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{t('employer.workplaces.addNew.title')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('employer.workplaces.addNew.description')}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Applications Modal */}
        <Dialog open={isApplicationsModalOpen} onOpenChange={setIsApplicationsModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{t('employer.workplaces.applicationsModal.title')}</DialogTitle>
              <DialogDescription>
                {t('employer.workplaces.applicationsModal.description')}
              </DialogDescription>
            </DialogHeader>

            {requestsError && (
              <div className="p-3 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm">
                {requestsError}
              </div>
            )}

            {requestsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : myRequests.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">{t('employer.workplaces.applicationsModal.noApplications')}</p>
              </Card>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {myRequests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {request.workplaceCompanyName ||
                            `${t('employer.workplaces.workplaceLabel')} #${request.workplaceId}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('employer.workplaces.applicationsModal.appliedOn', {
                            date: format(new Date(request.createdAt), 'MMM d, yyyy'),
                          })}
                        </p>
                        {request.note && (
                          <p className="text-sm text-muted-foreground">
                            {t('employer.workplaces.applicationsModal.note', { note: request.note })}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-2">
                        <Badge className={getStatusClasses(request.status)} variant="outline">
                          {getStatusLabel(request.status)}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {t('employer.workplaces.applicationsModal.updatedOn', {
                            date: format(new Date(request.updatedAt), 'MMM d, yyyy'),
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* New Workplace Modal */}
        <NewWorkplaceModal
          open={isNewWorkplaceModalOpen}
          onOpenChange={setIsNewWorkplaceModalOpen}
          onCreateWorkplace={() => setIsCreateWorkplaceModalOpen(true)}
          onJoinWorkplace={() => setIsJoinWorkplaceModalOpen(true)}
        />

        {/* Create Workplace Modal */}
        <CreateWorkplaceModal
          open={isCreateWorkplaceModalOpen}
          onOpenChange={setIsCreateWorkplaceModalOpen}
          onSuccess={loadWorkplaces}
        />

        {/* Join Workplace Modal */}
        <JoinWorkplaceModal
          open={isJoinWorkplaceModalOpen}
          onOpenChange={setIsJoinWorkplaceModalOpen}
          onSuccess={loadWorkplaces}
        />
      </div>
    </div>
  );
}

