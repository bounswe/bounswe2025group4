import { Button } from "@shared/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface LikeDislikeButtonsProps {
  likes: number;
  dislikes: number;
  onLike: () => void;
  onDislike: () => void;
  // Optional: whether the current user has liked/disliked (if available from backend)
  activeLike?: boolean;
  activeDislike?: boolean;
  // Show loading/spinner state for optimistic feedback
  likeLoading?: boolean;
  dislikeLoading?: boolean;
  disabled?: boolean;
}

const LikeDislikeButtons = ({
  likes,
  dislikes,
  onLike,
  onDislike,
  activeLike = false,
  activeDislike = false,
  likeLoading = false,
  dislikeLoading = false,
  disabled = false,
}: LikeDislikeButtonsProps) => {
  const likeClass = `h-5 w-5 ${activeLike || likeLoading ? 'fill-current text-primary' : ''}`;
  const dislikeClass = `h-5 w-5 ${activeDislike || dislikeLoading ? 'fill-current text-destructive' : ''}`;

  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onLike}
        className={`flex items-center gap-2 ${activeLike || likeLoading ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'} transition-all`}
        aria-label="Like"
        disabled={disabled || likeLoading}
      >
        <ThumbsUp className={likeClass} />
        <span className="text-sm font-semibold">{likes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDislike}
        className={`flex items-center gap-2 ${activeDislike || dislikeLoading ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5'} transition-all`}
        aria-label="Dislike"
        disabled={disabled || dislikeLoading}
      >
        <ThumbsDown className={dislikeClass} />
        <span className="text-sm font-semibold">{dislikes}</span>
      </Button>
    </div>
  );
};

export default LikeDislikeButtons;
