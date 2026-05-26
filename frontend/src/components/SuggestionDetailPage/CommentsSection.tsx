import { Button } from '../ui/Button/Button';
import { CommentItem } from './CommentItem';
import { useCommentDraft } from '../../hooks/useCommentDraft';
import type { CommentNode } from '../../types/api';
import styles from '../../assets/SuggestionDetailPage.module.css';

interface CommentsSectionProps {
  projectId: string;
  suggestionId: string;
  comments: CommentNode[];
  commentsError: string | null;
  currentUserId: string | null;
  replyingToId: string | null;
  editingId: string | null;
  submitting?: boolean;
  onSendMain: (text: string) => Promise<void>;
  onStartReply: (id: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (parentId: string, text: string) => Promise<void>;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => void;
}

const countComments = (nodes: CommentNode[]): number =>
  nodes.reduce((sum, node) => sum + 1 + countComments(node.children), 0);

export function CommentsSection({
  projectId,
  suggestionId,
  comments,
  commentsError,
  currentUserId,
  replyingToId,
  editingId,
  submitting = false,
  onSendMain,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: CommentsSectionProps) {
  const { draftText, saveStatus, statusLabel, handleTextChange, clearDraft } =
    useCommentDraft(projectId, suggestionId, null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftText.trim()) return;

    try {
      await onSendMain(draftText.trim());
      await clearDraft();
    } catch {
      // Ошибка уже показана родительским компонентом.
    }
  };

  return (
    <div className={styles.card}>
      <h3>Обсуждение ({countComments(comments)})</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Оставьте комментарий..."
          rows={3}
          className={styles.commentInput}
          value={draftText}
          onChange={(e) => handleTextChange(e.target.value)}
          disabled={saveStatus === 'saving'}
        />
        {statusLabel && (
          <div className={styles.draftStatusRow}>
            <span className={styles.draftStatus}>{statusLabel}</span>
          </div>
        )}
        <div className={styles.commentActions}>
          <Button
            variant="primary"
            type="submit"
            disabled={
              submitting || saveStatus === 'saving' || !draftText.trim()
            }
          >
            {submitting ? 'Отправка...' : 'Отправить'}
          </Button>
        </div>
      </form>

      {commentsError && <p className={styles.error}>{commentsError}</p>}

      <div className={styles.comments}>
        {!commentsError && comments.length === 0 && (
          <p className={styles.empty}>Комментариев пока нет</p>
        )}
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            projectId={projectId}
            suggestionId={suggestionId}
            currentUserId={currentUserId}
            replyingToId={replyingToId}
            editingId={editingId}
            submitting={submitting}
            depth={1}
            onStartReply={onStartReply}
            onCancelReply={onCancelReply}
            onSubmitReply={onSubmitReply}
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
