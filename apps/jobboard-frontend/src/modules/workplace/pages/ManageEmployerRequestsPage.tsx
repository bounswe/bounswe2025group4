/**
 * ManageEmployerRequestsPage
 * Allows workplace administrators to view and manage employer join requests
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { Separator } from '@shared/components/ui/separator';
import { Check, X, Users, Trash2 } from 'lucide-react';
import {
  getEmployerRequests,
  resolveEmployerRequest,
  getWorkplaceEmployers,
  removeEmployer,
} from '@modules/employer/services/employer.service';
import { getWorkplaceById } from '@modules/workplace/services/workplace.service';
import type {
  EmployerRequestResponse,
  EmployerListItem,
  WorkplaceDetailResponse,
} from '@shared/types/workplace.types';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { getErrorMessage } from '@shared/utils/error-handler';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import CenteredError from '@shared/components/common/CenteredError';

export default function ManageEmployerRequestsPage() {
  const { workplaceId } = useParams<{ workplaceId: string }>();
  const { user } = useAuth();
  const [workplace, setWorkplace] = useState<WorkplaceDetailResponse | null>(null);
  const [requests, setRequests] = useState<EmployerRequestResponse[]>([]);
  const [employers, setEmployers] = useState<EmployerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return <CenteredLoader />
  }

  if (error || !workplace) {
    return (
      <CenteredError
        message={error || 'Workplace not found'}
        onRetry={loadData}
      />
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  return (
    <div className="bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Header */}
        <div className="mb-6">
          <Link to={`/workplace/${workplace.id}`}>
            <Button variant="ghost" size="sm" className="mb-2">
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
              <Link key={employer.userId} to={`/profile/${employer.userId}`}>
                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{employer.username}</p>
                      <p className="text-sm text-muted-foreground">{employer.email}</p>
                    </div>
                    {employer.userId !== user?.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveEmployer(employer.userId);
                        }}
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
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
