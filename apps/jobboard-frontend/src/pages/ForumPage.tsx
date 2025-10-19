import ForumPost from "@/components/forum/ForumPost";
import { useState } from "react";

const mockPost = {
  id: "1",
  title: "What are the best practices for writing a good resume?",
  content:
    "I'm a recent graduate and I'm looking for a job. I've been applying to a lot of jobs but I'm not getting any responses. I think my resume might be the problem. What are some best practices for writing a good resume? What should I include and what should I avoid?",
  author: "John Doe",
  tags: ["resume", "job-search", "career-advice"],
  likes: 10,
  dislikes: 2,
};

const mockComments = [
  {
    id: "1",
    author: "Jane Smith",
    content:
      "Great question! I'd recommend tailoring your resume to each job you apply for. Highlight the skills and experiences that are most relevant to the job description.",
    likes: 5,
    dislikes: 0,
  },
  {
    id: "2",
    author: "Peter Jones",
    content:
      "Make sure to use action verbs to describe your accomplishments. Instead of saying 'responsible for', say 'managed', 'led', or 'developed'.",
    likes: 3,
    dislikes: 1,
  },
];

const ForumPage = () => {
  const [comments, setComments] = useState(mockComments);

  const handleCommentSubmit = (content: string) => {
    const newComment = {
      id: (comments.length + 1).toString(),
      author: "New User", // In a real app, this would be the logged in user
      content,
      likes: 0,
      dislikes: 0,
    };
    setComments([...comments, newComment]);
  };

  const handleCommentEdit = (commentId: string, newContent: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, content: newContent } : comment
      )
    );
  };

  const handleCommentDelete = (commentId: string) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Forum Discussion</h1>
        <p className="text-muted-foreground text-sm">
          Share knowledge, ask questions, and connect with the community
        </p>
      </div>
      <ForumPost
        post={mockPost}
        comments={comments}
        onCommentSubmit={handleCommentSubmit}
        onCommentEdit={handleCommentEdit}
        onCommentDelete={handleCommentDelete}
      />
    </div>
  );
};

export default ForumPage;
