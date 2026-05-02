import { useState } from 'react';
import { Button } from '../ui/Button/Button';
import type { CommentNode } from '../../types/api';
import styles from '../../assets/SuggestionDetailPage.module.css';

interface CommentItemProps {
  comment: CommentNode;
  replyingToId: string | null;
  editingId: string | null;
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
  replyingToId,
  editingId,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: CommentItemProps) {
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.text);
  const [submittingReply, setSubmittingReply] = useState(false);

  const isReplying = replyingToId === comment.id;
  const isEditing = editingId === comment.id;

  const handleReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      // Вызываем пропс, который уже "знает" projectId и suggestionId
      await onSubmitReply(comment.id, replyText.trim());
      setReplyText('');
    } catch (err) {
      console.error('Ошибка при отправке ответа:', err);
    } finally {
      setSubmittingReply(false);
    }
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
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Ваш ответ..."
            rows={2}
            autoFocus
            className={styles.commentInput}
          />
          <div className={styles.replyActions}>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submittingReply || !replyText.trim()}
            >
              {submittingReply ? 'Отправка...' : 'Ответить'}
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
      )}
    </div>
  );
}
