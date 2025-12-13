import type { ChangeEvent } from 'react';
import { useState } from "react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { Input } from '@shared/components/ui/input';
import LikeDislikeButtons from "./LikeDislikeButtons";
import ReportDialog from "./ReportDialog";

interface CommentProps {
  comment: {
    id: string;
    author: string;
    content: string;
    likes: number;
    dislikes: number;
  };
  onEdit: (commentId: string, newContent: string) => void;
  onDelete: (commentId: string) => void;
  onLike?: (commentId: string) => void;
  onDislike?: (commentId: string) => void;
}

const Comment = ({ comment, onEdit, onDelete, onLike, onDislike }: CommentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);

  const handleEdit = () => {
    onEdit(comment.id, editedContent);
    setIsEditing(false);
  };

  return (
    <Card className="relative gap-3 py-3">
      <CardContent className="px-3 space-y-2">
        <div className="absolute top-2 right-2 z-10">
          <ReportDialog content={comment.content} />
        </div>
        <div className="flex items-center justify-between pr-6">
          <span className="font-semibold text-sm">{comment.author}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(comment.id)}>
              Delete
            </Button>
          </div>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editedContent}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedContent(e.target.value)}
            />
            <Button size="sm" onClick={handleEdit}>Save</Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
        )}
        <div className="flex items-center">
          <LikeDislikeButtons
            likes={likes}
            dislikes={dislikes}
            onLike={() => {
              setLikes(likes + 1);
              onLike?.(comment.id);
            }}
            onDislike={() => {
              setDislikes(dislikes + 1);
              onDislike?.(comment.id);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Comment;
