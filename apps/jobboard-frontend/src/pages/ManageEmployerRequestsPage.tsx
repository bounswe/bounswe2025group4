/**
 * ManageEmployerRequestsPage
 * Allows workplace administrators to view and manage employer join requests
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X, Users, AlertCircle, Trash2 } from 'lucide-react';
import {
  getEmployerRequests,
  resolveEmployerRequest,
  getWorkplaceEmployers,
  removeEmployer,
} from '@/services/employer.service';
import { getWorkplaceById } from '@/services/workplace.service';
import type {
  EmployerRequestResponse,
  EmployerListItem,
  WorkplaceDetailResponse,
} from '@/types/workplace.types';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/utils/error-handler';

export default function ManageEmployerRequestsPage() {
  const { workplaceId } = useParams<{ workplaceId: string }>();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [workplace, setWorkplace] = useState<WorkplaceDetailResponse | null>(null);
  const [requests, setRequests] = useState<EmployerRequestResponse[]>([]);
  const [employers, setEmployers] = useState<EmployerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [workplaceId]);

  const loadData = async () => {
    if (!workplaceId) return;

    setLoading(true);
    setError(null);
    try {
      const id = parseInt(workplaceId, 10);
      const [workplaceData, requestsData, employersData] = await Promise.all([
        getWorkplaceById(id),
        getEmployerRequests(id),
        getWorkplaceEmployers(id),
      ]);

      setWorkplace(workplaceData);
      setRequests(requestsData.content);
      setEmployers(employersData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load workplace data');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveRequest = async (requestId: number, action: 'APPROVE' | 'REJECT') => {
    if (!workplaceId) return;

    setProcessingId(requestId);
    try {
      await resolveEmployerRequest(parseInt(workplaceId, 10), requestId, action);
      await loadData(); // Reload all data
    } catch (err: unknown) {
      console.error('Failed to resolve request:', err);
      alert(getErrorMessage(err, 'Failed to process request'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveEmployer = async (employerId: number) => {
    if (!workplaceId) return;
    if (!confirm('Are you sure you want to remove this employer?')) return;

    try {
      await removeEmployer(parseInt(workplaceId, 10), employerId);
      await loadData(); // Reload all data
    } catch (err: unknown) {
      console.error('Failed to remove employer:', err);
      alert(getErrorMessage(err, 'Failed to remove employer'));
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !workplace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-center mb-2">Error</h2>
          <p className="text-center text-muted-foreground mb-4">
            {error || 'Workplace not found'}
          </p>
          <Link to="/employer/workplaces">
            <Button className="w-full">Back to My Workplaces</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/workplace/${workplace.id}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to Workplace
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">{workplace.companyName}</h1>
          <p className="text-muted-foreground">Manage employer access and requests</p>
        </div>

        {/* Pending Requests Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-semibold">Pending Requests</h2>
            <Badge variant="secondary">{pendingRequests.length}</Badge>
          </div>

          {pendingRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No pending requests</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">User ID: {request.createdByUserId}</p>
                        <Badge variant="outline">{request.status}</Badge>
                      </div>
                      {request.note && (
                        <p className="text-sm text-muted-foreground mb-2">{request.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Requested on {format(new Date(request.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleResolveRequest(request.id, 'APPROVE')}
                        disabled={processingId === request.id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleResolveRequest(request.id, 'REJECT')}
                        disabled={processingId === request.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-8" />

        {/* Current Employers Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6" />
            <h2 className="text-2xl font-semibold">Current Employers</h2>
            <Badge variant="secondary">{employers.length}</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {employers.map((employer) => (
              <Card key={employer.userId} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium">{employer.username}</p>
                    <p className="text-sm text-muted-foreground">{employer.email}</p>
                  </div>
                  {employer.userId !== user?.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveEmployer(employer.userId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="outline">{employer.role}</Badge>
                  <p className="text-xs text-muted-foreground">
                    Joined {format(new Date(employer.joinedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
