import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
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
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('forum.comment.addPlaceholder')}
      />
      <Button type="submit">{t('forum.comment.submit')}</Button>
    </form>
  );
};

export default CommentForm;
