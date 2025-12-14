import { useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Download, FileText, MessageCircle, ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Label } from '@shared/components/ui/label';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import {
  useResumeReviewQuery,
  useResumeFileUrlQuery,
  useUploadResumeFileMutation,
  useMenteeMentorshipsQuery,
  useMentorMentorshipRequestsQuery,
} from '@modules/mentorship/services/mentorship.service';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { normalizeApiError } from '@shared/utils/error-handler';

export default function ResumeReviewPage() {
  const { resumeReviewId } = useParams<{ resumeReviewId: string }>();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeReviewIdNum = resumeReviewId ? parseInt(resumeReviewId, 10) : undefined;

  const resumeReviewQuery = useResumeReviewQuery(
    resumeReviewIdNum,
    Boolean(resumeReviewIdNum && user?.id)
  );
  const resumeFileUrlQuery = useResumeFileUrlQuery(
    resumeReviewIdNum,
    Boolean(resumeReviewIdNum && user?.id && (resumeReviewQuery.data?.fileUrl ?? false))
  );
  const uploadResumeFileMutation = useUploadResumeFileMutation(resumeReviewIdNum ?? 0);
  const menteeMentorshipsQuery = useMenteeMentorshipsQuery(user?.id, Boolean(user?.id));
  const mentorRequestsQuery = useMentorMentorshipRequestsQuery(user?.id, Boolean(user?.id));

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const mentorship = useMemo(() => {
    if (!resumeReviewIdNum) return null;
    const menteeMentorships = menteeMentorshipsQuery.data ?? [];
    return (
      menteeMentorships.find((m) => m.resumeReviewId === resumeReviewIdNum) ?? null
    );
  }, [menteeMentorshipsQuery.data, resumeReviewIdNum]);

  const mentorMentorshipRequest = useMemo(() => {
    const requests = mentorRequestsQuery.data ?? [];
    return requests.find((r) => r.status?.toUpperCase() === 'ACCEPTED') ?? null;
  }, [mentorRequestsQuery.data]);

  const isMentee = Boolean(mentorship);
  const resumeReview = resumeReviewQuery.data ?? null;
  const resumeFileUrl = resumeFileUrlQuery.data ?? resumeReview?.fileUrl ?? null;

  const loadError =
    resumeReviewQuery.error || menteeMentorshipsQuery.error || mentorRequestsQuery.error;

  if (!resumeReviewIdNum) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">Resume Review Not Found</h1>
        <Button asChild>
          <Link to="/mentorship/my">Back to My Mentorships</Link>
        </Button>
      </div>
    );
  }

  if (loadError) {
    const normalized = normalizeApiError(loadError, 'Failed to load resume review');
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">{normalized.friendlyMessage}</h1>
        <Button asChild>
          <Link to="/mentorship/my">Back to My Mentorships</Link>
        </Button>
      </div>
    );
  }

  if (
    resumeReviewQuery.isLoading ||
    menteeMentorshipsQuery.isLoading ||
    mentorRequestsQuery.isLoading ||
    (resumeReview?.fileUrl && resumeFileUrlQuery.isLoading)
  ) {
    return <CenteredLoader />;
  }

  if (!resumeReview) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">Resume Review Not Found</h1>
        <Button asChild>
          <Link to="/mentorship/my">Back to My Mentorships</Link>
        </Button>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, DOC, or DOCX files.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadResume = async () => {
    if (!resumeReviewIdNum || !selectedFile) return;

    try {
      await uploadResumeFileMutation.mutateAsync(selectedFile);
      toast.success('Resume uploaded successfully!');

      await Promise.all([resumeReviewQuery.refetch(), resumeFileUrlQuery.refetch()]);

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      console.error('Error uploading resume:', err);
      const normalized = normalizeApiError(err, 'Failed to upload resume');
      toast.error(normalized.friendlyMessage);
    }
  };

  const isActive = resumeReview.reviewStatus?.toUpperCase() === 'ACTIVE';
  const isCompleted = resumeReview.reviewStatus?.toUpperCase() === 'COMPLETED';
  const isClosed = resumeReview.reviewStatus?.toUpperCase() === 'CLOSED';

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/mentorship/my" className="hover:text-foreground transition-colors">
          My Mentorships
        </Link>
        <span>/</span>
        <span className="text-foreground">Resume Review</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isMentee ? 'Upload Resume' : 'Review Resume'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isMentee
              ? 'Upload your resume for mentor review'
              : 'Review the mentee\'s resume'}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/mentorship/my">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isActive && (
                  <>
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="font-medium text-green-600">Active</span>
                  </>
                )}
                {isCompleted && (
                  <>
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="font-medium text-blue-600">Completed</span>
                  </>
                )}
                {isClosed && (
                  <>
                    <div className="h-3 w-3 rounded-full bg-gray-500" />
                    <span className="font-medium text-gray-600">Closed</span>
                  </>
                )}
              </div>
              {mentorship && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/chat?mentorshipId=${mentorship.mentorshipRequestId}`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Open Chat
                  </Link>
                </Button>
              )}
              {!isMentee && mentorMentorshipRequest && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/chat?mentorshipId=${mentorMentorshipRequest.id}`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Open Chat
                  </Link>
                </Button>
              )}
            </div>
          </Card>

          {isMentee && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume
              </h2>
              
              {resumeFileUrl ? (
                <div className="space-y-4">
                  <div className="border border-border rounded-lg overflow-hidden bg-muted/50">
                    <iframe
                      src={resumeFileUrl}
                      className="w-full h-[600px]"
                      title="Resume PDF"
                    />
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <a
                      href={resumeFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Resume
                    </a>
                  </Button>

                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-2 block">Upload New Resume</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">{selectedFile.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(selectedFile.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          onClick={handleUploadResume}
                          disabled={uploadResumeFileMutation.isPending}
                          className="w-full"
                        >
                          {uploadResumeFileMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Resume
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Select File
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-8 text-center border border-dashed border-muted-foreground/30 rounded-lg bg-muted/30">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">No resume uploaded yet</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-background max-w-md mx-auto">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">{selectedFile.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(selectedFile.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          onClick={handleUploadResume}
                          disabled={uploadResumeFileMutation.isPending}
                          className="w-full max-w-md mx-auto"
                        >
                          {uploadResumeFileMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Resume
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="max-w-md mx-auto"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Select File
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}

          {!isMentee && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume
              </h2>
              
              {resumeFileUrl ? (
                <div className="space-y-4">
                  <div className="border border-border rounded-lg overflow-hidden bg-muted/50">
                    <iframe
                      src={resumeFileUrl}
                      className="w-full h-[600px]"
                      title="Resume PDF"
                    />
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <a
                      href={resumeFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Resume
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-muted-foreground/30 rounded-lg bg-muted/30">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No resume uploaded yet</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
