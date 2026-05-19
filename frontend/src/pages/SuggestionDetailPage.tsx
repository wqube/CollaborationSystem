import { useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs';
import { CommentsSection } from '../components/SuggestionDetailPage/CommentsSection';
import { SuggestionDetailSidebar } from '../components/SuggestionDetailPage/SuggestionDetailSidebar';
import { SuggestionHeader } from '../components/SuggestionDetailPage/SuggestionHeader';
import styles from '../assets/SuggestionDetailPage.module.css';
import { useSuggestionComments } from '../hooks/useSuggestionComments';
import { useSuggestionDetailData } from '../hooks/useSuggestionDetailData';
import { userAppSelector } from '../shared/store/hooks';
import type { ProjectRole } from '../types/api';

export function SuggestionDetailPage() {
  const { projectId, suggestionId } = useParams<{
    projectId: string;
    suggestionId: string;
  }>();
  const location = useLocation();
  const currentUserId = userAppSelector((state) => state.auth.user?.id ?? null);
  const initialUserRole = (
    location.state as { userRole?: ProjectRole } | undefined
  )?.userRole;

  const {
    detail,
    userRole,
    voteQuota,
    error,
    voteError,
    loading,
    handleStatusChange,
    handleTextChange,
    handleVote,
  } = useSuggestionDetailData({
    projectId,
    suggestionId,
    initialUserRole,
  });

  const commentsState = useSuggestionComments({
    projectId,
    suggestionId,
  });

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  }, []);

  if (loading && !detail) {
    return <p className={styles.state}>Загрузка...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (!detail || !projectId || !suggestionId) {
    return <p className={styles.error}>Предложение не найдено</p>;
  }

  return (
    <div className={styles.page}>
      {loading && <div className={styles.overlayLoader}>Загрузка...</div>}
      <Breadcrumbs currentSuggestionTitle={detail.text} />

      <div className={styles.twoColumns}>
        <div className={styles.main}>
          <SuggestionHeader
            detail={detail}
            userRole={userRole}
            canEditText={detail.author.id === currentUserId}
            onTextChange={handleTextChange}
            onStatusChange={handleStatusChange}
          />

          <CommentsSection
            projectId={projectId}
            suggestionId={suggestionId}
            comments={commentsState.comments}
            commentsError={commentsState.commentsError}
            currentUserId={currentUserId}
            replyingToId={commentsState.replyingToId}
            editingId={commentsState.editingId}
            submitting={commentsState.submitting}
            onSendMain={commentsState.sendMainComment}
            onStartReply={commentsState.startReply}
            onCancelReply={commentsState.cancelReply}
            onSubmitReply={commentsState.submitReply}
            onStartEdit={commentsState.startEdit}
            onCancelEdit={commentsState.cancelEdit}
            onSaveEdit={commentsState.saveEdit}
            onDelete={commentsState.deleteComment}
          />
        </div>

        <SuggestionDetailSidebar
          detail={detail}
          loading={loading}
          voteQuota={voteQuota}
          voteError={voteError}
          onVote={handleVote}
          onCopyLink={handleCopyLink}
        />
      </div>
    </div>
  );
}
