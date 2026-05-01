import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { Badge } from '../components/ui/Badge/Badge';
import { VoteButton } from '../components/ui/VoteButton/VoteButton';
import { getSuggestionDetails } from '../shared/api/suggestions';
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from '../shared/api/comments';
import type {
  SuggestionDetails,
  CommentDto,
  CommentNode,
  SuggestionStatus,
} from '../types/api';
import styles from '../assets/SuggestionDetailPage.module.css';

const buildCommentTree = (comments: CommentDto[]): CommentNode[] => {
  const map: Record<string, CommentNode> = {};
  const roots: CommentNode[] = [];

  comments.forEach((c) => {
    map[c.id] = { ...c, children: [] };
  });

  comments.forEach((c) => {
    if (c.parentCommentId && map[c.parentCommentId]) {
      map[c.parentCommentId].children.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  // Сортировка по дате, новые сверху
  const byDate = (a: CommentNode, b: CommentNode) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  roots.sort(byDate);
  const sortChildrens = (node: CommentNode) => {
    node.children.sort(byDate);
    node.children.forEach(sortChildrens);
  };
  roots.forEach(sortChildrens);

  return roots;
};

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

const CommentItem = ({
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
}: CommentItemProps) => {
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.text);
  const [submittingReply, setSubmittingReply] = useState(false);

  const isReplying = replyingToId === comment.id;
  const isEditing = editingId === comment.id;

  const handleReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true); // можно убрать если удалить стэйт
    try {
      // Вызываем пропс, который уже "знает" projectId и suggestionId
      await onSubmitReply(comment.id, replyText.trim());
      setReplyText('');
    } catch (err) {
      console.error('Ошибка при отправке ответа:', err);
      // setError вызывается внутри пропса, если нужно
    }
    // finally { setSubmittingReply(false); }
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
};

export function SuggestionDetailPage() {
  const { projectId, suggestionId } = useParams<{
    projectId: string;
    suggestionId: string;
  }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<SuggestionDetails | null>(null);
  const [commentTree, setCommentTree] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI-состояния для комментариев
  const [mainText, setMainText] = useState('');
  const [submittingMain, setSubmittingMain] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId || !suggestionId) return;
    setLoading(true);
    setError(null);
    try {
      const [detailsRes, commentsRes] = await Promise.all([
        getSuggestionDetails(projectId, suggestionId),
        getComments(projectId, suggestionId),
      ]);
      setDetail(detailsRes);
      setCommentTree(buildCommentTree(commentsRes));
    } catch {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [projectId, suggestionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Хендлеры
  const handleSendMain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainText.trim() || !projectId || !suggestionId) return;
    setSubmittingMain(true);
    try {
      await createComment(projectId, suggestionId, {
        text: mainText.trim(),
        parentCommentId: null,
      });
      setMainText('');
      await fetchData();
    } catch {
      setError('Не удалось отправить комментарий');
    } finally {
      setSubmittingMain(false);
    }
  };

  const handleSubmitReply = async (parentId: string, text: string) => {
    if (!projectId || !suggestionId) return;
    await createComment(projectId, suggestionId, {
      text,
      parentCommentId: parentId,
    });
    setReplyingToId(null);
    await fetchData();
  };

  const handleSaveEdit = async (id: string, text: string) => {
    if (!projectId) return;
    try {
      await updateComment(projectId, id, { text });
      setEditingId(null);
      await fetchData();
    } catch {
      alert('Ошибка при обновлении комментария');
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!projectId) return;
    try {
      await deleteComment(projectId, id);
      await fetchData();
    } catch {
      alert('Ошибка при удалении комментария');
    }
  };

  if (loading) return <p className={styles.state}>Загрузка...</p>;
  if (error || !detail)
    return <p className={styles.error}>{error || 'Не найдено'}</p>;

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU');
  const getBadgeVariant = (s: SuggestionStatus) =>
    s === 'New'
      ? 'new'
      : s === 'InProgress'
        ? 'progress'
        : s === 'Accepted'
          ? 'accepted'
          : 'rejected';

  return (
    <div className={styles.page}>
      <Button variant="outline" onClick={() => navigate(-1)}>
        Назад к списку
      </Button>

      <div className={styles.twoColumns}>
        <div className={styles.main}>
          <div className={styles.card}>
            <div className={styles.top}>
              <div>
                <h1>{detail.text}</h1>
                <div className={styles.meta}>
                  <Badge variant={getBadgeVariant(detail.status)} />
                  <span>Автор: {detail.author.displayName}</span>
                  <span>Создано: {formatDate(detail.createdAt)}</span>
                </div>
              </div>
              <select
                className={styles.statusSelect}
                value={detail.status}
                disabled
              >
                <option>New</option>
                <option>InProgress</option>
                <option>Accepted</option>
                <option>Rejected</option>
              </select>
            </div>
            <p className={styles.description}>{detail.text}</p>
            <div className={styles.meta}>
              id: {detail.id.slice(0, 8)}... | updated:{' '}
              {formatDate(detail.updatedAt)}
            </div>
          </div>

          <div className={styles.card}>
            <h3>Обсуждение ({commentTree.length})</h3>
            <form onSubmit={handleSendMain}>
              <textarea
                placeholder="Оставьте комментарий..."
                rows={3}
                className={styles.commentInput}
                value={mainText}
                onChange={(e) => setMainText(e.target.value)}
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
              {commentTree.length === 0 && (
                <p className={styles.empty}>Комментариев пока нет</p>
              )}
              {commentTree.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  replyingToId={replyingToId}
                  editingId={editingId}
                  onStartReply={(id) => setReplyingToId(id)}
                  onCancelReply={() => setReplyingToId(null)}
                  onSubmitReply={handleSubmitReply}
                  onStartEdit={(id) => setEditingId(id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={handleSaveEdit}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h3>Голосование</h3>
            <div className={styles.votePanel}>
              <VoteButton
                type="up"
                size="lg"
                active={detail.currentUserVote === 'Up'}
              />
              <span className={styles.bigScore}>{detail.score}</span>
              <VoteButton
                type="down"
                size="lg"
                active={detail.currentUserVote === 'Down'}
              />
            </div>
            <Button variant="outline" fullWidth>
              {detail.currentUserVote ? 'Отменить голос' : 'Голосовать'}
            </Button>
            <div className={styles.voters}>
              {detail.votes.length > 0 && (
                <>
                  <h4>
                    Up ({detail.votes.filter((v) => v.voteType === 'Up').length}
                    )
                  </h4>
                  <div className={styles.tags}>
                    {detail.votes
                      .filter((v) => v.voteType === 'Up')
                      .map((v) => (
                        <span key={v.userId}>{v.displayName}</span>
                      ))}
                  </div>
                  <h4>
                    Down (
                    {detail.votes.filter((v) => v.voteType === 'Down').length})
                  </h4>
                  <div className={styles.tags}>
                    {detail.votes
                      .filter((v) => v.voteType === 'Down')
                      .map((v) => (
                        <span key={v.userId}>{v.displayName}</span>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className={styles.card}>
            <h4>Действия</h4>
            <Button variant="outline" fullWidth>
              Копировать ссылку
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
