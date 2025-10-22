import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, DollarSign, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import type { Mentor } from "@/types/mentor";

interface MentorCardProps {
  mentor: Mentor;
}

const MentorCard = ({ mentor }: MentorCardProps) => {
  const navigate = useNavigate();
  const isAvailable = mentor.mentees < mentor.capacity;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={mentor.profileImage} alt={mentor.name} />
            <AvatarFallback>
              {mentor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{mentor.name}</CardTitle>
            <CardDescription className="text-sm">{mentor.title}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{mentor.bio}</p>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(mentor.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm font-semibold">{mentor.rating}</span>
          <span className="ml-1 text-sm text-muted-foreground">({mentor.reviews} reviews)</span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>Mentoring: {mentor.mentees}/{mentor.capacity}</span>
          </div>
          
          {mentor.hourlyRate && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>${mentor.hourlyRate}/hour</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span className="truncate">{mentor.availability}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {mentor.specialties.slice(0, 3).map((specialty) => (
            <Badge key={specialty} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
          {mentor.specialties.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{mentor.specialties.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link to={`/mentorship/${mentor.id}`}>
            View Profile
          </Link>
        </Button>
        <Button disabled={!isAvailable} variant="outline" size="sm" onClick={() => navigate(`/mentorship/${mentor.id}/request`)}>
          {isAvailable ? "Request" : "Full"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MentorCard;
