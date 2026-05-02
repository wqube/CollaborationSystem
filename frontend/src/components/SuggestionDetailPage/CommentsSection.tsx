import { Button } from '../ui/Button/Button';
import { CommentItem } from './CommentItem';
import type { CommentNode } from '../../types/api';
import styles from '../../assets/SuggestionDetailPage.module.css';

interface CommentsSectionProps {
  comments: CommentNode[];
  mainText: string;
  submittingMain: boolean;
  replyingToId: string | null;
  editingId: string | null;
  onMainTextChange: (text: string) => void;
  onSendMain: (e: React.FormEvent) => void;
  onStartReply: (id: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (parentId: string, text: string) => Promise<void>;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => void;
}

export function CommentsSection({
  comments,
  mainText,
  submittingMain,
  replyingToId,
  editingId,
  onMainTextChange,
  onSendMain,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: CommentsSectionProps) {
  return (
    <div className={styles.card}>
      <h3>Обсуждение ({comments.length})</h3>

      <form onSubmit={onSendMain}>
        <textarea
          placeholder="Оставьте комментарий..."
          rows={3}
          className={styles.commentInput}
          value={mainText}
          onChange={(e) => onMainTextChange(e.target.value)}
          disabled={submittingMain}
        />
        <div className={styles.commentActions}>
          <Button
            variant="primary"
            type="submit"
            disabled={submittingMain || !mainText.trim()}
          >
            {submittingMain ? 'Отправка...' : 'Отправить'}
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
            replyingToId={replyingToId}
            editingId={editingId}
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
