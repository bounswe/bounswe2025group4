import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import LikeDislikeButtons from "./LikeDislikeButtons";
import { useState } from "react";
import ReportDialog from "./ReportDialog";

interface ForumPostProps {
  post: {
    id: string;
    title: string;
    content: string;
    author: string;
    tags: string[];
    likes: number;
    dislikes: number;
  };
  comments: {
    id: string;
    author: string;
    content: string;
    likes: number;
    dislikes: number;
  }[];
  onCommentSubmit: (content: string) => void;
  onCommentEdit: (commentId: string, newContent: string) => void;
  onCommentDelete: (commentId: string) => void;
}

const ForumPost = ({
  post,
  comments,
  onCommentSubmit,
  onCommentEdit,
  onCommentDelete,
}: ForumPostProps) => {
  const [likes, setLikes] = useState(post.likes);
  const [dislikes, setDislikes] = useState(post.dislikes);

  return (
    <Card className="relative gap-4 py-4">
      <div className="absolute top-3 right-3 z-10">
        <ReportDialog content={post.content} />
      </div>
      <CardHeader className="px-4">
        <CardTitle className="text-xl pr-8">{post.title}</CardTitle>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>By {post.author}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-4 space-y-6">
        <p className="text-sm leading-relaxed">{post.content}</p>
        <div className="flex items-center gap-2">
          <LikeDislikeButtons
            likes={likes}
            dislikes={dislikes}
            onLike={() => setLikes(likes + 1)}
            onDislike={() => setDislikes(dislikes + 1)}
          />
          <Button variant="outline" size="sm">Edit</Button>
          <Button variant="destructive" size="sm">Delete</Button>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-3">Comments ({comments.length})</h3>
          <div className="space-y-3">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onEdit={onCommentEdit}
                onDelete={onCommentDelete}
              />
            ))}
          </div>
        </div>

        <div>
          <CommentForm onSubmit={onCommentSubmit} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumPost;
