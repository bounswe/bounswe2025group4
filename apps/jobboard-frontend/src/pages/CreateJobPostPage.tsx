import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { createJob } from '@/services/jobs.service';
import type { CreateJobPostRequest } from '@/types/api.types';
import type { EthicalTag } from '@/types/job';

type JobPostFormData = {
  title: string;
  description: string;
  company: string;
  location: string;
  remote: boolean;
  minSalary: string;
  maxSalary: string;
  contactEmail: string;
  ethicalTags: EthicalTag[];
  inclusiveOpportunity: boolean;
};

export default function CreateJobPostPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobPostFormData>({
    title: '',
    description: '',
    company: '',
    location: '',
    remote: false,
    minSalary: '',
    maxSalary: '',
    contactEmail: '',
    ethicalTags: [],
    inclusiveOpportunity: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const requestData: CreateJobPostRequest = {
        title: formData.title,
        description: formData.description,
        company: formData.company,
        location: formData.location,
        remote: formData.remote,
        minSalary: parseInt(formData.minSalary, 10),
        maxSalary: parseInt(formData.maxSalary, 10),
        contact: formData.contactEmail,
        ethicalTags: formData.ethicalTags.join(', '),
        inclusiveOpportunity: formData.inclusiveOpportunity,
      };

      await createJob(requestData);
      navigate('/employer/dashboard');
    } catch (err) {
      console.error('Error creating job:', err);
      setError('Failed to create job posting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
            Create a New Job Posting
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fill in the information below to post a new job opportunity to your company's profile
          </p>
        </div>

        {/* Form Card */}
        <Card className="border border-border bg-card shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 lg:p-8">
            {/* Job Title */}
            <div className="mb-6">
              <Label htmlFor="title" className="text-sm font-semibold">
                Job Title
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="eg: Senior Product Manager"
                className="mt-2"
                required
              />
            </div>

            {/* Job Description */}
            <div className="mb-6">
              <Label htmlFor="description" className="text-sm font-semibold">
                Job Description
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of the role, responsibilities, qualifications, and company culture"
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] resize-y"
                required
              />
            </div>

            {/* Company Name */}
            <div className="mb-6">
              <Label htmlFor="company" className="text-sm font-semibold">
                Company Name
              </Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="eg: Tech Innovators Inc."
                className="mt-2"
                required
              />
            </div>

            {/* Location */}
            <div className="mb-6">
              <Label htmlFor="location" className="text-sm font-semibold">
                Location
              </Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="eg: San Francisco, CA"
                className="mt-2"
                required
              />
            </div>

            {/* Remote Work */}
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="remote"
                  checked={formData.remote}
                  onCheckedChange={() => setFormData({ ...formData, remote: !formData.remote })}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="remote" className="text-sm font-medium cursor-pointer">
                    Remote Work Available
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Check this if the position offers remote work options
                  </p>
                </div>
              </div>
            </div>

            {/* Salary Range */}
            <div className="mb-6">
              <Label className="text-sm font-semibold">Salary Range (USD)</Label>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="minSalary" className="text-xs text-muted-foreground">
                    Minimum
                  </Label>
                  <Input
                    id="minSalary"
                    type="number"
                    value={formData.minSalary}
                    onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                    placeholder="e.g., 80000"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxSalary" className="text-xs text-muted-foreground">
                    Maximum
                  </Label>
                  <Input
                    id="maxSalary"
                    type="number"
                    value={formData.maxSalary}
                    onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                    placeholder="e.g., 120000"
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Email */}
            <div className="mb-6">
              <Label htmlFor="contactEmail" className="text-sm font-semibold">
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="Enter contact email for applicants"
                className="mt-2"
                required
              />
            </div>

            {/* Ethical Tags */}
            <div className="mb-6">
              <Label className="text-sm font-semibold">Ethical Tags</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Select tags that represent your company's ethical commitments and values
              </p>
              <MultiSelectDropdown
                selectedTags={formData.ethicalTags}
                onTagsChange={(tags) => setFormData({ ...formData, ethicalTags: tags })}
                placeholder="Select ethical tags"
              />
            </div>

            {/* Inclusive Opportunity */}
            <div className="mb-8">
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
                  <Label htmlFor="inclusiveOpportunity" className="text-sm font-medium cursor-pointer">
                    More on Inclusive Opportunity
                  </Label>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Submit Job Posting'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
