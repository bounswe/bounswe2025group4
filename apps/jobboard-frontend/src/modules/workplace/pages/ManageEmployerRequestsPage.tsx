/**
 * ManageEmployerRequestsPage
 * Allows workplace administrators to view and manage employer join requests
 */

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { Separator } from '@shared/components/ui/separator';
import { Check, X, Users, Trash2 } from 'lucide-react';
import {
  resolveEmployerRequest,
  useEmployerRequestsQuery,
  useWorkplaceEmployersQuery,
  useRemoveEmployerMutation,
} from '@modules/employer/services/employer.service';
import { useWorkplaceQuery } from '@modules/workplace/services/workplace.service';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { getErrorMessage } from '@shared/utils/error-handler';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import CenteredError from '@shared/components/common/CenteredError';

export default function ManageEmployerRequestsPage() {
  const { workplaceId } = useParams<{ workplaceId: string }>();
  const workplaceIdNumber = workplaceId ? parseInt(workplaceId, 10) : undefined;
  const { user } = useAuth();
  const {
    data: workplace,
    isLoading: workplaceLoading,
    refetch: refetchWorkplace,
    isError: workplaceError,
  } = useWorkplaceQuery(workplaceIdNumber, undefined, Boolean(workplaceIdNumber));
  const {
    data: requestsData,
    isLoading: requestsLoading,
    isError: requestsError,
    refetch: refetchRequests,
  } = useEmployerRequestsQuery(workplaceIdNumber, undefined, Boolean(workplaceIdNumber));
  const {
    data: employersData,
    isLoading: employersLoading,
    isError: employersError,
    refetch: refetchEmployers,
  } = useWorkplaceEmployersQuery(workplaceIdNumber, Boolean(workplaceIdNumber));
  const requests = requestsData?.content ?? [];
  const employers = employersData ?? [];
  const loading = workplaceLoading || requestsLoading || employersLoading;
  const [processingId, setProcessingId] = useState<number | null>(null);
  const error = workplaceError || requestsError || employersError ? 'Failed to load workplace data' : null;
  const resolveRequestMutation = useMutation({
    mutationFn: ({ requestId, action }: { requestId: number; action: 'APPROVE' | 'REJECT' }) => {
      if (!workplaceIdNumber) throw new Error('Missing workplace id');
      return resolveEmployerRequest(workplaceIdNumber, requestId, action);
    },
    onSuccess: async () => {
      await Promise.all([refetchRequests(), refetchEmployers(), refetchWorkplace()]);
    },
    onError: (err: unknown) => {
      alert(getErrorMessage(err, 'Failed to process request'));
    },
  });
  const removeEmployerMutation = useRemoveEmployerMutation(workplaceIdNumber ?? 0);

  const handleResolveRequest = async (requestId: number, action: 'APPROVE' | 'REJECT') => {
    if (!workplaceIdNumber) return;

    setProcessingId(requestId);
    try {
      await resolveRequestMutation.mutateAsync({ requestId, action });
    } catch (err: unknown) {
      console.error('Failed to resolve request:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveEmployer = async (employerId: number) => {
    if (!workplaceIdNumber) return;
    if (!confirm('Are you sure you want to remove this employer?')) return;

    try {
      await removeEmployerMutation.mutateAsync(employerId);
      await Promise.all([refetchEmployers(), refetchRequests(), refetchWorkplace()]);
    } catch (err: unknown) {
      console.error('Failed to remove employer:', err);
    }
  };


  if (loading) {
    return <CenteredLoader />;
  }

  if (error || !workplace) {
    return (
      <CenteredError
        message={error || 'Workplace not found'}
        onRetry={() => {
          refetchWorkplace();
          refetchRequests();
          refetchEmployers();
        }}
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
