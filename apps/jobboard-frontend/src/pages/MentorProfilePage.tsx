import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, DollarSign, Globe, Github, Linkedin, Award, GraduationCap, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { Mentor, MentorshipReview } from '@/types/mentor';

// Mock data - Backend gelince API'den çekilecek
const mockMentor: Mentor = {
  id: "1",
  name: "Alice Johnson",
  title: "Senior Software Engineer at Google",
  bio: "I have 10 years of experience in software development and I'm passionate about helping new developers grow. I specialize in React, TypeScript, and building scalable applications. I've mentored over 50 developers and helped them land their dream jobs at top tech companies.",
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

const mockReviews: MentorshipReview[] = [
  {
    id: "1",
    menteeName: "Sarah Chen",
    menteeAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    rating: 5,
    comment: "Alice is an amazing mentor! She helped me transition from backend to frontend development and land a job at Meta. Her guidance on React best practices was invaluable.",
    date: "2024-01-15",
    mentorshipDuration: "6 months"
  },
  {
    id: "2",
    menteeName: "Mike Rodriguez",
    menteeAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    rating: 5,
    comment: "Excellent mentor with deep technical knowledge. Alice helped me prepare for senior-level interviews and gave me confidence to apply for bigger roles.",
    date: "2024-01-08",
    mentorshipDuration: "4 months"
  },
  {
    id: "3",
    menteeName: "Emily Watson",
    menteeAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
    rating: 4,
    comment: "Very knowledgeable and patient. Alice provided great career advice and helped me understand complex React concepts. Highly recommended!",
    date: "2023-12-20",
    mentorshipDuration: "3 months"
  }
];

const MentorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Mock - Backend gelince API'den çekilecek
  const mentor = mockMentor;
  const reviews = mockReviews;

  const isAvailable = mentor.mentees < mentor.capacity;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="w-32 h-32">
            <AvatarImage src={mentor.profileImage} alt={mentor.name} />
            <AvatarFallback className="text-2xl">
              {mentor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{mentor.name}</h1>
            <p className="text-xl text-muted-foreground mb-4">{mentor.title}</p>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(mentor.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
                <span className="ml-2 font-semibold">{mentor.rating}</span>
                <span className="ml-1 text-muted-foreground">({mentor.reviews} reviews)</span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Remote</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{mentor.availability}</span>
              </div>
              
              {mentor.hourlyRate && (
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>${mentor.hourlyRate}/hour</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-6">
              {mentor.linkedinUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {mentor.githubUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={mentor.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </a>
                </Button>
              )}
              {mentor.websiteUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={mentor.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
            </div>

            <Button 
              size="lg" 
              disabled={!isAvailable}
              className="w-full md:w-auto"
              onClick={() => navigate(`/mentorship/${id}/request`)}
            >
              {isAvailable ? "Request Mentorship" : "Currently Unavailable"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
            </CardContent>
          </Card>

          {/* Experience & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{mentor.experience}</p>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Key Achievements:</h4>
                  <ul className="space-y-1">
                    {mentor.achievements.map((achievement, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <Award className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{mentor.education}</p>
              </CardContent>
            </Card>
          </div>

          {/* Specialties & Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mentor.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mentor.languages.map((language) => (
                    <Badge key={language} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id}>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.menteeAvatar} alt={review.menteeName} />
                        <AvatarFallback>
                          {review.menteeName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{review.menteeName}</h4>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {review.mentorshipDuration}
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-2">{review.comment}</p>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    {review.id !== reviews[reviews.length - 1].id && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mentorship Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Mentorship Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Mentees:</span>
                <span className="font-semibold">{mentor.mentees}/{mentor.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Reviews:</span>
                <span className="font-semibold">{mentor.reviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Rating:</span>
                <span className="font-semibold">{mentor.rating}/5</span>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mentor.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorProfilePage;
