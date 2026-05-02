import { Button } from '../ui/Button/Button';
import { CommentItem } from './CommentItem';
import { useCommentDraft } from '../../hooks/useCommentDraft';
import type { CommentNode } from '../../types/api';
import styles from '../../assets/SuggestionDetailPage.module.css';

interface CommentsSectionProps {
  projectId: string;
  suggestionId: string;
  comments: CommentNode[];
  replyingToId: string | null;
  editingId: string | null;
  onSendMain: (text: string) => Promise<void>;
  onClearMainDraft: () => void;
  onStartReply: (id: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (parentId: string, text: string) => Promise<void>;
  onClearReplyDraft: () => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => void;
}

export function CommentsSection({
  projectId,
  suggestionId,
  comments,
  replyingToId,
  editingId,
  onSendMain,
  onClearMainDraft,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onClearReplyDraft,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: CommentsSectionProps) {
  // Используем хук для основного комментария (parentCommentId = null)
  const { draftText, saveStatus, statusLabel, handleTextChange, clearDraft } =
    useCommentDraft(projectId, suggestionId, null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftText.trim()) return;
    await onSendMain(draftText.trim());
    await clearDraft();
    onClearMainDraft(); // сброс UI стейта родителя
  };

  return (
    <div className={styles.card}>
      <h3>Обсуждение ({comments.length})</h3>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Оставьте комментарий..."
          rows={3}
          className={styles.commentInput}
          value={draftText}
          onChange={(e) => handleTextChange(e.target.value)}
          disabled={saveStatus === 'saving'}
        />
        <div className={styles.commentActions}>
          {statusLabel && (
            <span className={styles.draftStatus}>{statusLabel}</span>
          )}
          <Button
            variant="primary"
            type="submit"
            disabled={saveStatus === 'saving' || !draftText.trim()}
          >
            Отправить
          </Button>
        </div>
      </form>

      <div className={styles.comments}>
        {comments.length === 0 && (
          <p className={styles.empty}>Комментариев пока нет</p>
        )}
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            projectId={projectId}
            suggestionId={suggestionId}
            replyingToId={replyingToId}
            editingId={editingId}
            onStartReply={onStartReply}
            onCancelReply={onCancelReply}
            onSubmitReply={onSubmitReply}
            onClearReplyDraft={onClearReplyDraft}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
