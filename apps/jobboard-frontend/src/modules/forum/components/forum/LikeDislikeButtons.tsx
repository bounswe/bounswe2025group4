import { Button } from "@shared/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface LikeDislikeButtonsProps {
  likes: number;
  dislikes: number;
  onLike: () => void;
  onDislike: () => void;
}

const LikeDislikeButtons = ({ likes, dislikes, onLike, onDislike }: LikeDislikeButtonsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onLike}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        aria-label="Like"
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="text-xs font-medium">{likes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDislike}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
        aria-label="Dislike"
      >
        <ThumbsDown className="h-4 w-4" />
        <span className="text-xs font-medium">{dislikes}</span>
      </Button>
    </div>
  );
};

export default LikeDislikeButtons;
