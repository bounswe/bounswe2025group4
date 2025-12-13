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
  const likeClass = `h-4 w-4 ${activeLike || likeLoading ? 'fill-current text-primary' : ''}`;
  const dislikeClass = `h-4 w-4 ${activeDislike || dislikeLoading ? 'fill-current text-destructive' : ''}`;

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onLike}
        className={`flex items-center gap-2 text-sm ${activeLike || likeLoading ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition-colors`}
        aria-label="Like"
        disabled={disabled || likeLoading}
      >
        <ThumbsUp className={likeClass} />
        <span className="text-xs font-medium">{likes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDislike}
        className={`flex items-center gap-2 text-sm ${activeDislike || dislikeLoading ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'} transition-colors`}
        aria-label="Dislike"
        disabled={disabled || dislikeLoading}
      >
        <ThumbsDown className={dislikeClass} />
        <span className="text-xs font-medium">{dislikes}</span>
      </Button>
    </div>
  );
};

export default LikeDislikeButtons;
