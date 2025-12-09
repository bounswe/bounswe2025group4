import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Building2, Plus, UserPlus } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Checkbox } from '@shared/components/ui/checkbox';
import { Card } from '@shared/components/ui/card';
import WorkplaceSelector from '@/modules/workplace/components/WorkplaceSelector';
import { CreateWorkplaceModal } from '@/modules/workplace/components/CreateWorkplaceModal';
import { JoinWorkplaceModal } from '@/modules/workplace/components/JoinWorkplaceModal';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/components/ui/dialog';
import { RequiredMark } from '@shared/components/ui/required-mark';
import { useCreateJobMutation } from '@modules/jobs/services/jobs.service';
import { useMyWorkplacesQuery } from '@modules/employer/services/employer.service';
import type { CreateJobPostRequest } from '@shared/types/api.types';
import type { EmployerWorkplaceBrief } from '@shared/types/workplace.types';
type JobPostFormData = {
  title: string;
  description: string;
  workplaceId: number | null;
  remote: boolean;
  minSalary: string;
  maxSalary: string;
  contact: string;
  inclusiveOpportunity: boolean;
  nonProfit: boolean;
};

const defaultFormState: JobPostFormData = {
  title: '',
  description: '',
  workplaceId: null,
  remote: false,
  minSalary: '',
  maxSalary: '',
  contact: '',
  inclusiveOpportunity: false,
  nonProfit: false,
};

interface CreateJobPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialWorkplace?: EmployerWorkplaceBrief | null;
}

export function CreateJobPostModal({
  open,
  onOpenChange,
  onSuccess,
  initialWorkplace,
}: CreateJobPostModalProps) {
  const { t } = useTranslation('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasWorkplaces, setHasWorkplaces] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [formData, setFormData] = useState<JobPostFormData>(defaultFormState);
  const workplacesQuery = useMyWorkplacesQuery();
  const isLoadingWorkplaces = workplacesQuery.isLoading;
  const workplaces = useMemo<EmployerWorkplaceBrief[]>(
    () => (Array.isArray(workplacesQuery.data) ? workplacesQuery.data : []),
    [workplacesQuery.data]
  );
  const createJobMutation = useCreateJobMutation();

  const selectedInitialWorkplace = useMemo(
    () => initialWorkplace ?? null,
    [initialWorkplace]
  );

  useEffect(() => {
    if (!open) {
      setFormData(defaultFormState);
      setIsSubmitting(false);
      return;
    }

    setFormData({
      ...defaultFormState,
      workplaceId: selectedInitialWorkplace?.workplace.id ?? null,
    });

    setHasWorkplaces(workplaces.length > 0);

    if (!selectedInitialWorkplace && workplaces.length > 0) {
      const primary = workplaces[0];
      setFormData((prev) => ({
        ...prev,
        workplaceId: prev.workplaceId ?? primary.workplace.id,
      }));
    }
  }, [open, selectedInitialWorkplace, workplaces]);

  const handleWorkplaceChange = (workplaceId: number, _workplace: EmployerWorkplaceBrief) => {
    setFormData((prev) => ({
      ...prev,
      workplaceId,
    }));
  };

  const handleWorkplaceCreated = () => {
    setShowCreateModal(false);
    setHasWorkplaces(true);
  };

  const handleJoinSuccess = () => {
    setShowJoinModal(false);
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.workplaceId) {
      toast.error(t('employer.createJob.workplaceRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      const requestData: CreateJobPostRequest = {
        title: formData.title,
        description: formData.description,
        workplaceId: formData.workplaceId,
        remote: formData.remote,
        minSalary: formData.nonProfit ? 0 : parseInt(formData.minSalary, 10),
        maxSalary: formData.nonProfit ? 0 : parseInt(formData.maxSalary, 10),
        contact: formData.contact,
        inclusiveOpportunity: formData.inclusiveOpportunity,
        nonProfit: formData.nonProfit,
      };

      await createJobMutation.mutateAsync(requestData);
      toast.success(t('employer.createJob.submitSuccess'));
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Error creating job:', err);
      toast.error(t('employer.createJob.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderNoWorkplaces = () => (
    <div className="space-y-4">
      <Card className="border border-border bg-card shadow-sm">
        <div className="p-6 text-center">
          <Building2 className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {t('employer.createJob.noWorkplaces.title')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('employer.createJob.noWorkplaces.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('employer.createJob.noWorkplaces.createWorkplace')}
            </Button>
            <Button variant="outline" onClick={() => setShowJoinModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t('employer.createJob.noWorkplaces.joinWorkplace')}
            </Button>
          </div>
        </div>
      </Card>

      <CreateWorkplaceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleWorkplaceCreated}
      />
      <JoinWorkplaceModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl min-w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('employer.createJob.title')}</DialogTitle>
        </DialogHeader>

        {isLoadingWorkplaces ? (
          <div className="py-8">
            <CenteredLoader />
          </div>
        ) : !hasWorkplaces ? (
          renderNoWorkplaces()
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">
                <span className="inline-flex items-start gap-0.5">
                  {t('employer.createJob.workplace')}
                  <RequiredMark />
                </span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                {t('employer.createJob.workplaceDescription')}
              </p>
              <WorkplaceSelector
                value={formData.workplaceId ?? undefined}
                onChange={handleWorkplaceChange}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="title" className="text-sm font-semibold">
                <span className="inline-flex items-start gap-0.5">
                  {t('employer.createJob.jobTitle')}
                  <RequiredMark />
                </span>
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('employer.createJob.jobTitlePlaceholder')}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold">
                <span className="inline-flex items-start gap-0.5">
                  {t('employer.createJob.jobDescription')}
                  <RequiredMark />
                </span>
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('employer.createJob.jobDescriptionPlaceholder')}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] resize-y"
                required
              />
            </div>


            <div className="flex items-start gap-3">
              <Checkbox
                id="remote"
                checked={formData.remote}
                onCheckedChange={() => setFormData({ ...formData, remote: !formData.remote })}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="remote" className="text-sm font-medium cursor-pointer">
                  {t('employer.createJob.remoteWork')}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('employer.createJob.remoteWorkDescription')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="nonProfit"
                checked={formData.nonProfit}
                onCheckedChange={() => setFormData({ 
                  ...formData, 
                  nonProfit: !formData.nonProfit,
                  // Clear salary fields when nonprofit is enabled
                  minSalary: !formData.nonProfit ? '' : formData.minSalary,
                  maxSalary: !formData.nonProfit ? '' : formData.maxSalary
                })}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="nonProfit" className="text-sm font-medium cursor-pointer">
                  {t('employer.createJob.nonProfit')}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('employer.createJob.nonProfitDescription')}
                </p>
              </div>
            </div>

            {/* Salary Range - Hidden for nonprofit positions */}
            {!formData.nonProfit && (
              <div>
                <Label className="text-sm font-semibold">
                  <span className="inline-flex items-start gap-0.5">
                    {t('employer.createJob.salaryRange')}
                    <RequiredMark />
                  </span>
                </Label>
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="minSalary" className="text-xs text-muted-foreground">
                      {t('employer.createJob.minimum')}
                    </Label>
                    <Input
                      id="minSalary"
                      type="number"
                      value={formData.minSalary}
                      onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                      placeholder={t('employer.createJob.minSalaryPlaceholder')}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxSalary" className="text-xs text-muted-foreground">
                      {t('employer.createJob.maximum')}
                    </Label>
                    <Input
                      id="maxSalary"
                      type="number"
                      value={formData.maxSalary}
                      onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                      placeholder={t('employer.createJob.maxSalaryPlaceholder')}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="contactEmail" className="text-sm font-semibold">
                <span className="inline-flex items-start gap-0.5">
                  {t('employer.createJob.contactEmail')}
                  <RequiredMark />
                </span>
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder={t('employer.createJob.contactEmailPlaceholder')}
                className="mt-2"
                required
              />
            </div>



            <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="inclusiveOpportunity"
                  checked={formData.inclusiveOpportunity}
                  onCheckedChange={() =>
                    setFormData({ ...formData, inclusiveOpportunity: !formData.inclusiveOpportunity })
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="inclusiveOpportunity" className="text-sm font-semibold cursor-pointer">
                    {t('employer.createJob.inclusiveOpportunity')}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('employer.createJob.inclusiveOpportunityDescription')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('common.cancel') ?? 'Cancel'}
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? t('employer.createJob.submitting') : t('employer.createJob.submit')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CreateJobPostModal;

