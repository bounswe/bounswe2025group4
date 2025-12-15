import { Button } from "@shared/components/ui/button";
import { Textarea } from "@shared/components/ui/textarea";
import { Card, CardContent } from "@shared/components/ui/card";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CommentFormProps {
  onSubmit: (content: string) => void;
}

const CommentForm = ({ onSubmit }: CommentFormProps) => {
  const { t } = useTranslation('common');
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent("");
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="px-4 py-4">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <Textarea
            className="bg-card text-base min-h-24 w-full"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('forum.comment.addPlaceholder')}
          />
          <div className="flex justify-end">
            <Button type="submit">{t('forum.comment.submit')}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CommentForm;
