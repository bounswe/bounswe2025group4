import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, MessageCircle, Star, Calendar, Target } from 'lucide-react';
import type { Mentorship, MentorshipStatus } from '@/types/mentor';

// Mock data - Backend gelince API'den çekilecek
const mockMentorships: Mentorship[] = [
  {
    id: "1",
    mentorId: "1",
    mentorName: "Alice Johnson",
    mentorTitle: "Senior Software Engineer at Google",
    mentorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    menteeId: "user1",
    menteeName: "You",
    status: "active",
    createdAt: "2024-01-15",
    acceptedAt: "2024-01-16",
    goals: [
      "Master React hooks and state management",
      "Learn TypeScript best practices",
      "Improve system design skills"
    ],
    expectedDuration: "6 months",
    message: "Hi Alice, I'm interested in learning React and TypeScript...",
    preferredTime: "Weekday evenings"
  },
  {
    id: "2",
    mentorId: "2",
    mentorName: "Bob Williams",
    mentorTitle: "Product Manager at Microsoft",
    mentorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    menteeId: "user1",
    menteeName: "You",
    status: "pending",
    createdAt: "2024-01-20",
    goals: [
      "Learn product management fundamentals",
      "Prepare for PM interviews",
      "Understand user research methods"
    ],
    expectedDuration: "3 months",
    message: "Hi Bob, I'm looking to transition into product management...",
    preferredTime: "Weekends"
  },
  {
    id: "3",
    mentorId: "3",
    mentorName: "Charlie Brown",
    mentorTitle: "UX Designer at Apple",
    mentorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    menteeId: "user1",
    menteeName: "You",
    status: "completed",
    createdAt: "2023-10-01",
    acceptedAt: "2023-10-02",
    completedAt: "2024-01-01",
    goals: [
      "Improve UX design skills",
      "Build a strong portfolio",
      "Learn design systems"
    ],
    expectedDuration: "3 months",
    message: "Hi Charlie, I'm a junior designer looking to improve...",
    preferredTime: "Flexible"
  }
];

const getStatusIcon = (status: MentorshipStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'accepted':
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'completed':
      return <Star className="h-4 w-4 text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: MentorshipStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'accepted':
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const MyMentorshipsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mentorships] = useState<Mentorship[]>(mockMentorships);
  
  // Success message from request page
  const successMessage = location.state?.message;
  const mentorName = location.state?.mentorName;

  const activeMentorships = mentorships.filter(m => m.status === 'active');
  const pendingMentorships = mentorships.filter(m => m.status === 'pending');
  const completedMentorships = mentorships.filter(m => m.status === 'completed');
  const rejectedMentorships = mentorships.filter(m => m.status === 'rejected');

  const MentorshipCard = ({ mentorship }: { mentorship: Mentorship }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={mentorship.mentorAvatar} alt={mentorship.mentorName} />
            <AvatarFallback>
              {mentorship.mentorName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{mentorship.mentorName}</h3>
              <Badge className={`text-xs ${getStatusColor(mentorship.status)}`}>
                {getStatusIcon(mentorship.status)}
                <span className="ml-1 capitalize">{t(`myMentorships.status.${mentorship.status}`)}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{mentorship.mentorTitle}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t('myMentorships.started')}: {new Date(mentorship.createdAt).toLocaleDateString()}</span>
          </div>
          
          {mentorship.acceptedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>{t('myMentorships.accepted')}: {new Date(mentorship.acceptedAt).toLocaleDateString()}</span>
            </div>
          )}
          
          {mentorship.completedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>{t('myMentorships.completed')}: {new Date(mentorship.completedAt).toLocaleDateString()}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>{t('myMentorships.duration')}: {mentorship.expectedDuration}</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">{t('myMentorships.learningGoals')}:</h4>
          <ul className="space-y-1">
            {mentorship.goals.map((goal, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start">
                <span className="mr-2">•</span>
                {goal}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2 pt-2">
          {mentorship.status === 'active' && (
            <Button size="sm" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('myMentorships.openChat')}
            </Button>
          )}
          
          {mentorship.status === 'completed' && (
            <Button size="sm" variant="outline" className="flex-1">
              <Star className="h-4 w-4 mr-2" />
              {t('myMentorships.writeReview')}
            </Button>
          )}
          
          {mentorship.status === 'pending' && (
            <Button size="sm" variant="outline" disabled className="flex-1">
              <Clock className="h-4 w-4 mr-2" />
              {t('myMentorships.waitingForResponse')}
            </Button>
          )}
          
          {mentorship.status === 'rejected' && (
            <Button size="sm" variant="outline" className="flex-1">
              {t('myMentorships.viewDetails')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('myMentorships.title')}</h1>
        <p className="text-muted-foreground">
          {t('myMentorships.subtitle')}
        </p>
        
        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">
              <strong>Success!</strong> {successMessage} {mentorName && `to ${mentorName}`}
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">
            {t('myMentorships.active')} ({activeMentorships.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            {t('myMentorships.pending')} ({pendingMentorships.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t('myMentorships.completed')} ({completedMentorships.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            {t('myMentorships.rejected')} ({rejectedMentorships.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeMentorships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeMentorships.map((mentorship) => (
                <MentorshipCard key={mentorship.id} mentorship={mentorship} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('myMentorships.noActive')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('myMentorships.noActiveDesc')}
                </p>
                <Button asChild>
                  <a href="/mentorship">{t('myMentorships.findMentors')}</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingMentorships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingMentorships.map((mentorship) => (
                <MentorshipCard key={mentorship.id} mentorship={mentorship} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('myMentorships.noPending')}</h3>
                <p className="text-muted-foreground">
                  {t('myMentorships.noPendingDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedMentorships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedMentorships.map((mentorship) => (
                <MentorshipCard key={mentorship.id} mentorship={mentorship} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('myMentorships.noCompleted')}</h3>
                <p className="text-muted-foreground">
                  {t('myMentorships.noCompletedDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedMentorships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rejectedMentorships.map((mentorship) => (
                <MentorshipCard key={mentorship.id} mentorship={mentorship} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('myMentorships.noRejected')}</h3>
                <p className="text-muted-foreground">
                  {t('myMentorships.noRejectedDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyMentorshipsPage;
