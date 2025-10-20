import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Mentor } from "@/types/mentor";

interface MentorCardProps {
  mentor: Mentor;
}

const MentorCard = ({ mentor }: MentorCardProps) => {
  const isAvailable = mentor.mentees < mentor.capacity;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mentor.name}</CardTitle>
        <CardDescription>{mentor.title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">{mentor.bio}</p>
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < mentor.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-muted-foreground">({mentor.reviews} reviews)</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Mentoring: {mentor.mentees} / {mentor.capacity}</span>
        </div>
        <div className="flex pt-2 space-x-2">
          {mentor.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={!isAvailable}>
          {isAvailable ? "Request Mentorship" : "Unavailable"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MentorCard;
