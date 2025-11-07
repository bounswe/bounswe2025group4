/**
 * EmployerWorkplacesPage
 * Lists all workplaces the current employer manages
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Building2 } from 'lucide-react';
import { WorkplaceCard } from '@/components/workplace/WorkplaceCard';
import { getMyWorkplaces } from '@/services/employer.service';
import type { EmployerWorkplaceBrief } from '@/types/workplace.types';

export default function EmployerWorkplacesPage() {
  const { t } = useTranslation('common');
  const [workplaces, setWorkplaces] = useState<EmployerWorkplaceBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkplaces();
  }, []);

  const loadWorkplaces = async () => {
    try {
      setLoading(true);
      const data = await getMyWorkplaces();
      setWorkplaces(data);
    } catch (err) {
      console.error('Failed to load workplaces:', err);
      setError('Failed to load your workplaces');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Workplaces</h1>
            <p className="text-muted-foreground">
              Manage your workplaces and respond to reviews
            </p>
          </div>
          <Button asChild>
            <Link to="/employer/workplace/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Workplace
            </Link>
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-6 border-destructive">
            <p className="text-destructive">{error}</p>
            <Button onClick={loadWorkplaces} variant="outline" className="mt-4">
              Try Again
            </Button>
          </Card>
        )}

        {/* Empty State */}
        {!error && workplaces.length === 0 && (
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Workplaces Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first workplace or request to join an existing one
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/employer/workplace/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workplace
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/employer/workplace/join">Join Workplace</Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Workplaces Grid */}
        {!error && workplaces.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workplaces.map(({ workplace, role }) => (
              <div key={workplace.id} className="relative">
                <WorkplaceCard workplace={workplace} />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Role: {role}
                  </span>
                  <Link to={`/workplace/${workplace.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
