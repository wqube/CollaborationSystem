import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { SuggestionHeader } from '../components/SuggestionDetailPage/SuggestionHeader';
import { VotePanel } from '../components/SuggestionDetailPage/VotePanel';
import { CommentsSection } from '../components/SuggestionDetailPage/CommentsSection';
import { Breadcrumbs } from '../components/Breadcrumbs/BreadCrumbs';
import {
  getSuggestionDetails,
  updateSuggestionStatus,
  voteSuggestion,
  deleteVote,
} from '../shared/api/suggestions';
import { getDashboard } from '../shared/api/dashboard';
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

  const byDate = (a: CommentNode, b: CommentNode) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  roots.sort(byDate);
  const sortChildren = (node: CommentNode) => {
    node.children.sort(byDate);
    node.children.forEach(sortChildren);
  };
  roots.forEach(sortChildren);
  return roots;
};

export function SuggestionDetailPage() {
  const { projectId, suggestionId } = useParams<{
    projectId: string;
    suggestionId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [detail, setDetail] = useState<SuggestionDetails | null>(null);
  const [commentTree, setCommentTree] = useState<CommentNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const userRoleFromState = (
    location.state as { userRole?: ProjectRole } | undefined
  )?.userRole;
  const [userRole, setUserRole] = useState<ProjectRole>(
    userRoleFromState ?? 'Member',
  );

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!projectId || !suggestionId) return;
      if (!silent) setLoading(true);
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
    },
    [projectId, suggestionId],
  );

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    if (userRoleFromState) {
      setUserRole(userRoleFromState);
      return;
    }

    if (!projectId) return;

    let ignore = false;

    getDashboard(projectId, { pageSize: 1 })
      .then((data) => {
        if (!ignore) {
          setUserRole(data.project.role);
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [projectId, userRoleFromState]);

  const handleSendMain = async (text: string): Promise<void> => {
    if (!projectId || !suggestionId || !text.trim()) return;
    setIsSubmittingComment(true);
    try {
      await createComment(projectId, suggestionId, {
        text: text.trim(),
        parentCommentId: null,
      });
      await fetchData(true);
    } catch {
      setError('Не удалось отправить комментарий');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentId: string, text: string) => {
    if (!projectId || !suggestionId) return;
    setIsSubmittingComment(true);
    try {
      await createComment(projectId, suggestionId, {
        text,
        parentCommentId: parentId,
      });
      setReplyingToId(null);
      await fetchData(true);
    } catch {
      setError('Не удалось отправить ответ');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSaveEdit = async (id: string, text: string) => {
    if (!projectId) return;
    try {
      await updateComment(projectId, id, { text });
      setEditingId(null);
      await fetchData(true);
    } catch {
      alert('Ошибка при обновлении комментария');
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!projectId) return;
    setIsSubmittingComment(true);
    try {
      await deleteComment(projectId, id);
      await fetchData(true);
    } catch {
      alert('Ошибка при удалении комментария');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: SuggestionStatus) => {
    if (!projectId || !suggestionId) return;
    try {
      await updateSuggestionStatus(projectId, suggestionId, {
        status: newStatus,
      });
      await fetchData(true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      setError(
        status === 403
          ? 'Недостаточно прав для изменения статуса'
          : 'Ошибка при обновлении статуса',
      );
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  if (error || !detail)
    return <p className={styles.error}>{error || 'Не найдено'}</p>;

  return (
    <div className={styles.page}>
      {loading && <div className={styles.overlayLoader}>Загрузка...</div>}
      <Breadcrumbs />
      <div className={styles.topBar}>
        <Button variant="outline" size="md" onClick={() => navigate(-1)}>
          <img src="/left-arrow.png" width={16} height={16} alt="Назад" />
        </Button>
        <h1>Страница предложения</h1>
      </div>

      <div className={styles.twoColumns}>
        <div className={styles.main}>
          <SuggestionHeader
            detail={detail}
            userRole={userRole}
            onStatusChange={handleStatusChange}
          />

          <CommentsSection
            projectId={projectId!}
            suggestionId={suggestionId!}
            comments={commentTree}
            replyingToId={replyingToId}
            editingId={editingId}
            submitting={isSubmittingComment}
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
