import { Button } from '../ui/Button/Button';
import { useCommentDraft } from '../../hooks/useCommentDraft';
import styles from '../../assets/SuggestionDetailPage.module.css';

interface CommentReplyFormProps {
  projectId: string;
  suggestionId: string;
  parentCommentId: string;
  submitting?: boolean;
  onSubmit: (parentId: string, text: string) => Promise<void>;
  onCancel: () => void;
}

export function CommentReplyForm({
  projectId,
  suggestionId,
  parentCommentId,
  submitting = false,
  onSubmit,
  onCancel,
}: CommentReplyFormProps) {
  const { draftText, saveStatus, statusLabel, handleTextChange, clearDraft } =
    useCommentDraft(projectId, suggestionId, parentCommentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftText.trim()) return;

    try {
      await onSubmit(parentCommentId, draftText.trim());
      await clearDraft();
    } catch {
      // Ошибка уже показана родительским компонентом.
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.replyForm}>
      <textarea
        value={draftText}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="Ваш ответ..."
        rows={2}
        autoFocus
        className={styles.commentInput}
        disabled={saveStatus === 'saving'}
      />
      <div className={styles.replyActions}>
        {statusLabel && (
          <span className={styles.draftStatus}>{statusLabel}</span>
        )}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={submitting || saveStatus === 'saving' || !draftText.trim()}
        >
          {submitting ? 'Отправка...' : 'Ответить'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
