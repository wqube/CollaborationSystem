import { useState } from 'react';
import { Button } from '../ui/Button/Button';
import { useCommentDraft } from '../../hooks/useCommentDraft';
import type { CommentNode } from '../../types/api';
import styles from '../../assets/SuggestionDetailPage.module.css';

interface CommentItemProps {
  comment: CommentNode;
  projectId: string;
  suggestionId: string;
  replyingToId: string | null;
  editingId: string | null;
  submitting?: boolean;
  onStartReply: (id: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (parentId: string, text: string) => Promise<void>;
  onClearReplyDraft: () => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => void;
}

export function CommentItem({
  comment,
  projectId,
  suggestionId,
  replyingToId,
  editingId,
  submitting = false,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onClearReplyDraft,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: CommentItemProps) {
  const [editText, setEditText] = useState(comment.text);
  const isReplying = replyingToId === comment.id;
  const isEditing = editingId === comment.id;

  const { draftText, saveStatus, statusLabel, handleTextChange, clearDraft } =
    useCommentDraft(projectId, suggestionId, isReplying ? comment.id : null);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftText.trim()) return;
    await onSubmitReply(comment.id, draftText.trim());
    await clearDraft();
    onClearReplyDraft();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim() || editText === comment.text) return;
    await onSaveEdit(comment.id, editText.trim());
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU');

  return (
    <div className={styles.comment} key={comment.id}>
      <div className={styles.commentHeader}>
        <div className={styles.avatar}>
          {comment.author.displayName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <strong>{comment.author.displayName}</strong>
          <span className={styles.time}>{formatDate(comment.createdAt)}</span>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleEditSubmit} className={styles.editForm}>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
            autoFocus
            className={styles.commentInput}
          />
          <div className={styles.editActions}>
            <Button type="submit" variant="primary" size="sm">
              Сохранить
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancelEdit}
            >
              Отмена
            </Button>
          </div>
        </form>
      ) : (
        <p className={styles.commentText}>{comment.text}</p>
      )}

      {!isEditing && (
        <div className={styles.commentBtns}>
          <button type="button" onClick={() => onStartReply(comment.id)}>
            Ответить
          </button>
          <button type="button" onClick={() => onStartEdit(comment.id)}>
            Редактировать
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => {
              if (window.confirm('Удалить комментарий?')) onDelete(comment.id);
            }}
          >
            Удалить
          </button>
        </div>
      )}

      {isReplying && (
        <form onSubmit={handleReplySubmit} className={styles.replyForm}>
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
              disabled={
                submitting || saveStatus === 'saving' || !draftText.trim()
              }
            >
              {submitting ? 'Отправка...' : 'Ответить'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancelReply}
            >
              Отмена
            </Button>
          </div>
        </form>
      )}

      {comment.children.length > 0 && (
        <div className={styles.nested}>
          {comment.children.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              projectId={projectId}
              suggestionId={suggestionId}
              replyingToId={replyingToId}
              editingId={editingId}
              submitting={submitting}
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
      )}
    </div>
  );
}
