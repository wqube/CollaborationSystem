import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { SuggestionHeader } from '../components/SuggestionDetailPage/SuggestionHeader';
import { VotePanel } from '../components/SuggestionDetailPage/VotePanel';
import { CommentsSection } from '../components/SuggestionDetailPage/CommentsSection';
import { useLocation } from 'react-router-dom';
import {
  getSuggestionDetails,
  updateSuggestionStatus,
  voteSuggestion,
  deleteVote,
} from '../shared/api/suggestions';
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
  VoteType,
  ProjectRole,
} from '../types/api';
import styles from '../assets/SuggestionDetailPage.module.css';
import { Breadcrumbs } from '../components/Breadcrumbs/BreadCrumbs';

// !!!!!!!!!!!!!!!!!!!!!! Вынести построение дерева в utils !!!!!!!!!!!!!!!!!!!!!!!
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

export function SuggestionDetailPage() {
  const { projectId, suggestionId } = useParams<{
    projectId: string;
    suggestionId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Состояния данных
  const [detail, setDetail] = useState<SuggestionDetails | null>(null);
  const [commentTree, setCommentTree] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRoleFromState = location.state as
    | { userRole?: ProjectRole }
    | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userRole, _setUserRole] = useState<ProjectRole>(
    userRoleFromState?.userRole ?? 'Member',
  );

  // UI состояния для комментариев
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Загрузка данных
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
  const handleSendMain = async (text: string): Promise<void> => {
    if (!projectId || !suggestionId || !text.trim()) return;

    try {
      await createComment(projectId, suggestionId, {
        text: text.trim(),
        parentCommentId: null,
      });
      // Черновик очистится внутри CommentsSection через useCommentDraft
    } catch {
      setError('Не удалось отправить комментарий');
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

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert('Ссылка скопирована');
      })
      .catch(() => {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Ссылка скопирована');
      });
  };

  const handleStatusChange = async (newStatus: SuggestionStatus) => {
    if (!projectId || !suggestionId) return;
    try {
      await updateSuggestionStatus(projectId, suggestionId, {
        status: newStatus,
      });
      await fetchData();
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { statys?: number } }).response?.statys ===
          'number'
      ) {
        const status = (err as { response: { status: number } }).response
          .status;
        if (status === 403) {
          setError('Недостаточно прав для изменения статуса');
          return;
        }
      }
      setError('Ошибка при обновлении статуса');
    }
  };

  const handleVote = async (voteType: VoteType | null) => {
    if (!projectId || !suggestionId) return;
    try {
      const result =
        voteType === null
          ? await deleteVote(projectId, suggestionId)
          : await voteSuggestion(projectId, suggestionId, { voteType });

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              score: result.score,
              currentUserVote: result.currentUserVote,
            }
          : prev,
      );
    } catch {
      setError('Ошибка голосования');
    }
  };

  if (loading) return <p className={styles.state}>Загрузка...</p>;
  if (error || !detail)
    return <p className={styles.error}>{error || 'Не найдено'}</p>;

  return (
    <div className={styles.page}>
      <Breadcrumbs />
      <div className={styles.topBar}>
        <Button variant="outline" size="md" onClick={() => navigate(-1)}>
          <img src="/left-arrow.png" width={16} height={16} alt="Назад" />
        </Button>
        <h1>Страница предложения</h1>
      </div>

      <div className={styles.twoColumns}>
        <div className={styles.main}>
          {/* Заголовок с предложением */}
          <SuggestionHeader
            detail={detail}
            userRole={userRole}
            onStatusChange={handleStatusChange}
          />

          {/* Блок обсуждения */}
          <CommentsSection
            projectId={projectId!}
            suggestionId={suggestionId!}
            comments={commentTree}
            replyingToId={replyingToId}
            editingId={editingId}
            onSendMain={handleSendMain}
            onClearMainDraft={() => {}}
            onStartReply={(id) => setReplyingToId(id)}
            onCancelReply={() => setReplyingToId(null)}
            onSubmitReply={handleSubmitReply}
            onClearReplyDraft={() => {}}
            onStartEdit={(id) => setEditingId(id)}
            onCancelEdit={() => setEditingId(null)}
            onSaveEdit={handleSaveEdit}
            onDelete={handleDeleteComment}
          />
        </div>

        <div className={styles.sidebar}>
          {/* Блок голосования */}
          <VotePanel detail={detail} loading={loading} onVote={handleVote} />

          <div className={styles.card}>
            <h4>Действия</h4>
            <Button variant="outline" fullWidth onClick={handleCopyLink}>
              Копировать ссылку
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
