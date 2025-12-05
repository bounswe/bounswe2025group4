import { Button } from "@shared/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface LikeDislikeButtonsProps {
  likes: number;
  dislikes: number;
  onLike: () => void;
  onDislike: () => void;
}

const LikeDislikeButtons = ({
  likes,
  dislikes,
  onLike,
  onDislike,
}: LikeDislikeButtonsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm" onClick={onLike}>
        <ThumbsUp className="h-4 w-4 mr-1" />
        {likes}
      </Button>
      <Button variant="ghost" size="sm" onClick={onDislike}>
        <ThumbsDown className="h-4 w-4 mr-1" />
        {dislikes}
      </Button>
    </div>
  );
};

export default LikeDislikeButtons;
