import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ArrowLeft, Send, Clock, Users } from 'lucide-react';
import type { Mentor } from '@/types/mentor';

// Mock mentor data - Backend gelince API'den çekilecek
const mockMentor: Mentor = {
  id: "1",
  name: "Alice Johnson",
  title: "Senior Software Engineer at Google",
  bio: "I have 10 years of experience in software development and I'm passionate about helping new developers grow. I specialize in React, TypeScript, and building scalable applications.",
  rating: 4.9,
  reviews: 45,
  mentees: 3,
  capacity: 5,
  tags: ["React", "TypeScript", "Career Advice", "Interview Prep"],
  experience: "10+ years in software development",
  education: "MS Computer Science, Stanford University",
  linkedinUrl: "https://linkedin.com/in/alicejohnson",
  githubUrl: "https://github.com/alicejohnson",
  websiteUrl: "https://alicejohnson.dev",
  hourlyRate: 150,
  availability: "Monday-Friday, 6-9 PM PST",
  languages: ["English", "Spanish"],
  specialties: ["Frontend Development", "System Design", "Career Growth"],
  achievements: [
    "Led development of Google's main search interface",
    "Published 15+ technical articles",
    "Speaker at React Conf 2023"
  ],
  profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
};

const MentorshipRequestPage = () => {
  const { t } = useTranslation('common');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    message: '',
    goals: '',
    expectedDuration: '',
    preferredTime: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock - Backend gelince API'den çekilecek
  const mentor = mockMentor;
  
  const isAvailable = mentor.mentees < mentor.capacity;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock API call - Backend gelince gerçek API çağrısı yapılacak
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Success - Redirect to my mentorships page
      navigate('/my-mentorships', { 
        state: { 
          // Mock - Show success banner
          showSuccess: true,
          mentorName: mentor.name
        }
      });
    } catch (error) {
      console.error('Error sending mentorship request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/mentorship/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('mentorship.request.backToProfile')}
        </Button>
        
        <h1 className="text-3xl font-bold">{t('mentorship.request.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('mentorship.request.subtitle', { mentorName: mentor.name })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mentor Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={mentor.profileImage} alt={mentor.name} />
                  <AvatarFallback>
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{mentor.name}</h3>
                  <p className="text-sm text-muted-foreground">{mentor.title}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{mentor.rating}</span>
                <span className="text-sm text-muted-foreground">({mentor.reviews} {t('mentorship.request.reviews')})</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{t('mentorship.request.mentoring')}: {mentor.mentees}/{mentor.capacity}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{mentor.availability}</span>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">{t('mentorship.request.specialties')}:</h4>
                <div className="flex flex-wrap gap-1">
                  {mentor.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {!isAvailable && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    {t('mentorship.request.fullCapacity')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Request Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('mentorship.request.formTitle')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('mentorship.request.formDescription')}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">{t('mentorship.request.messageLabel')} *</Label>
                  <Textarea
                    id="message"
                    placeholder={t('mentorship.request.messagePlaceholder')}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={6}
                    required
                    disabled={!isAvailable}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('mentorship.request.messageHint')}
                  </p>
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <Label htmlFor="goals">{t('mentorship.request.goalsLabel')} *</Label>
                  <Textarea
                    id="goals"
                    placeholder={t('mentorship.request.goalsPlaceholder')}
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    rows={4}
                    required
                    disabled={!isAvailable}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('mentorship.request.goalsHint')}
                  </p>
                </div>

                {/* Expected Duration */}
                <div className="space-y-2">
                  <Label htmlFor="expectedDuration">{t('mentorship.request.durationLabel')} *</Label>
                  <Input
                    id="expectedDuration"
                    placeholder={t('mentorship.request.durationPlaceholder')}
                    value={formData.expectedDuration}
                    onChange={(e) => handleInputChange('expectedDuration', e.target.value)}
                    required
                    disabled={!isAvailable}
                  />
                </div>

                {/* Preferred Time */}
                <div className="space-y-2">
                  <Label htmlFor="preferredTime">{t('mentorship.request.timeLabel')}</Label>
                  <Input
                    id="preferredTime"
                    placeholder={t('mentorship.request.timePlaceholder')}
                    value={formData.preferredTime}
                    onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                    disabled={!isAvailable}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={!isAvailable || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('mentorship.request.sendingRequest')}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t('mentorship.request.sendRequest')}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/mentorship/${id}`)}
                  >
                    {t('mentorship.request.cancel')}
                  </Button>
                </div>

                {!isAvailable && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      <strong>Note:</strong> This mentor is currently at full capacity. 
                      You can still send a request, but they may not be able to accept it immediately.
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorshipRequestPage;
