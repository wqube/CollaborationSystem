import { useEffect, useState } from 'react';
import { Button } from '../ui/Button/Button';
import { CommentReplyForm } from './CommentReplyForm';
import type { CommentNode } from '../../types/api';
import styles from '../../assets/SuggestionDetailPage.module.css';

interface CommentItemProps {
  comment: CommentNode;
  projectId: string;
  suggestionId: string;
  currentUserId: string | null;
  replyingToId: string | null;
  editingId: string | null;
  submitting?: boolean;
  depth: number;
  onStartReply: (id: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (parentId: string, text: string) => Promise<void>;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => void;
}

export function CommentItem({
  comment,
  projectId,
  suggestionId,
  currentUserId,
  replyingToId,
  editingId,
  submitting = false,
  depth,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: CommentItemProps) {
  const [editText, setEditText] = useState(comment.text);
  const isReplying = replyingToId === comment.id;
  const isEditing = editingId === comment.id;
  const canManageComment = currentUserId === comment.author.id;
  const canReply = depth < 5;

  useEffect(() => {
    if (!isEditing) {
      setEditText(comment.text);
    }
  }, [comment.text, isEditing]);

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
          {canReply && (
            <button type="button" onClick={() => onStartReply(comment.id)}>
              Ответить
            </button>
          )}
          {canManageComment && (
            <>
              <button type="button" onClick={() => onStartEdit(comment.id)}>
                Редактировать
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => {
                  if (window.confirm('Удалить комментарий?')) {
                    onDelete(comment.id);
                  }
                }}
              >
                Удалить
              </button>
            </>
          )}
        </div>
      )}

      {isReplying && (
        <CommentReplyForm
          projectId={projectId}
          suggestionId={suggestionId}
          parentCommentId={comment.id}
          submitting={submitting}
          onSubmit={onSubmitReply}
          onCancel={onCancelReply}
        />
      )}

      {comment.children.length > 0 && (
        <div className={styles.nested}>
          {comment.children.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              projectId={projectId}
              suggestionId={suggestionId}
              currentUserId={currentUserId}
              replyingToId={replyingToId}
              editingId={editingId}
              submitting={submitting}
              depth={depth + 1}
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
      )}
    </div>
  );
}
