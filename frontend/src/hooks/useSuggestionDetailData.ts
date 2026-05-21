import { useCallback, useEffect, useState } from 'react';
import { getDashboard } from '../shared/api/dashboard';
import {
  deleteVote,
  getSuggestionDetails,
  getVoteQuotaFromError,
  isVoteLimitExceededError,
  updateSuggestionStatus,
  updateSuggestionText,
  voteSuggestion,
} from '../shared/api/suggestions';
import type {
  CurrentUserVoteQuota,
  ProjectRole,
  SuggestionDetails,
  SuggestionStatus,
  VoteType,
} from '../types/api';

interface UseSuggestionDetailDataParams {
  projectId: string | undefined;
  suggestionId: string | undefined;
  initialUserRole?: ProjectRole;
}

export function useSuggestionDetailData({
  projectId,
  suggestionId,
  initialUserRole,
}: UseSuggestionDetailDataParams) {
  const [detail, setDetail] = useState<SuggestionDetails | null>(null);
  const [userRole, setUserRole] = useState<ProjectRole>(
    initialUserRole ?? 'Member',
  );
  const [voteQuota, setVoteQuota] = useState<CurrentUserVoteQuota | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshDetail = useCallback(
    async (silent = false) => {
      if (!projectId || !suggestionId) {
        setLoading(false);
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await getSuggestionDetails(projectId, suggestionId);
        setDetail(response);
      } catch {
        setError('Ошибка загрузки предложения');
      } finally {
        setLoading(false);
      }
    },
    [projectId, suggestionId],
  );

  useEffect(() => {
    void refreshDetail(false);
  }, [refreshDetail]);

  useEffect(() => {
    if (initialUserRole) {
      setUserRole(initialUserRole);
    }

    if (!projectId) return;

    let ignore = false;

    getDashboard(projectId, { pageSize: 1 })
      .then((data) => {
        if (!ignore) {
          setUserRole(initialUserRole ?? data.project.role);
          setVoteQuota(data.currentUserVoteQuota);
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [projectId, initialUserRole]);

  const handleStatusChange = useCallback(
    async (newStatus: SuggestionStatus) => {
      if (!projectId || !suggestionId) return;

      try {
        await updateSuggestionStatus(projectId, suggestionId, {
          status: newStatus,
        });
        await refreshDetail(true);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        setError(
          status === 403
            ? 'Недостаточно прав для изменения статуса'
            : 'Ошибка при обновлении статуса',
        );
      }
    },
    [projectId, refreshDetail, suggestionId],
  );

  const handleTextChange = useCallback(
    async (text: string) => {
      if (!projectId || !suggestionId) return;

      try {
        const updated = await updateSuggestionText(projectId, suggestionId, {
          text,
        });

        setDetail((prev) =>
          prev
            ? {
                ...prev,
                text: updated.text,
                updatedAt: updated.updatedAt,
              }
            : prev,
        );
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        throw new Error(
          status === 403
            ? 'Редактировать предложение может только автор'
            : 'Ошибка при обновлении предложения',
        );
      }
    },
    [projectId, suggestionId],
  );

  const handleVote = useCallback(
    async (voteType: VoteType | null) => {
      if (!projectId || !suggestionId) return;

      try {
        setVoteError(null);
        const result =
          voteType === null
            ? await deleteVote(projectId, suggestionId)
            : await voteSuggestion(projectId, suggestionId, { voteType });

        setVoteQuota(result.voteQuota);
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                score: result.score,
                currentUserVote: result.currentUserVote,
              }
            : prev,
        );
      } catch (err: unknown) {
        const updatedQuota = getVoteQuotaFromError(err);

        if (updatedQuota) {
          setVoteQuota(updatedQuota);
        }

        setVoteError(
          isVoteLimitExceededError(err)
            ? 'Лимит голосов исчерпан'
            : 'Ошибка голосования',
        );
      }
    },
    [projectId, suggestionId],
  );

  return {
    detail,
    userRole,
    voteQuota,
    error,
    voteError,
    loading,
    handleStatusChange,
    handleTextChange,
    handleVote,
    refreshDetail,
  };
}
