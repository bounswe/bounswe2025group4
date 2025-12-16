import { Button } from "@shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import LikeDislikeButtons from "./LikeDislikeButtons";
import { useState } from "react";
import { Flag } from 'lucide-react';
import { useReportModal } from '@shared/hooks/useReportModal';
import { reportForumPost } from '@modules/workplace/services/workplace-report.service';

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
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  activeLike?: boolean;
  activeDislike?: boolean;
}

const ForumPost = ({
  post,
  comments,
  onCommentSubmit,
  onCommentEdit,
  onCommentDelete,
  onLike,
  onDislike,
  activeLike,
  activeDislike,
}: ForumPostProps) => {
  const likes = post.likes;
  const dislikes = post.dislikes;
  const [likeLoading, setLikeLoading] = useState(false);
  const [dislikeLoading, setDislikeLoading] = useState(false);

  const { openReport, ReportModalElement } = useReportModal();

  return (
    <>
      <Card className="gap-4 py-4">
        <CardHeader className="px-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{post.title}</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                <span>By {post.author}</span>
              </div>
            </div>
            <button
              onClick={() =>
                openReport({
                  title: 'Report Post',
                  subtitle: `Reporting post by ${post.author}`,
                  contextSnippet: post.content,
                  reportType: 'Post',
                  reportedName: post.author,
                  onSubmit: async (message) => {
                    await reportForumPost(Number(post.id), message);
                  },
                })
              }
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              title="Report Post"
            >
              <Flag className="h-4 w-4" />
              <span className="sr-only">Report Post</span>
            </button>
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
            onLike={async () => {
              try {
                setLikeLoading(true);
                const res = onLike?.(post.id);
                if (res && typeof (res as Promise<any>).then === 'function') await res;
              } finally {
                setLikeLoading(false);
              }
            }}
            onDislike={async () => {
              try {
                setDislikeLoading(true);
                const res = onDislike?.(post.id);
                if (res && typeof (res as Promise<any>).then === 'function') await res;
              } finally {
                setDislikeLoading(false);
              }
            }}
            likeLoading={likeLoading}
            dislikeLoading={dislikeLoading}
            activeLike={activeLike}
            activeDislike={activeDislike}
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
                postId={Number(post.id)}
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
      {ReportModalElement}
    </>
  );
};

export default ForumPost;
