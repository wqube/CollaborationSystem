import { useState, useCallback } from 'react';
import {
  getVoteQuotaFromError,
  isVoteLimitExceededError,
  voteSuggestion,
  deleteVote,
  type VoteResponse,
} from '../shared/api/suggestions';
import type { CurrentUserVoteQuota, VoteType } from '../types/api';

interface UseSuggestionVoteProps {
  projectId: string;
  suggestionId: string;
  initialScore: number;
  initialUserVote: VoteType | null;
  voteQuota?: CurrentUserVoteQuota | null;
  onVoteSuccess?: (response: VoteResponse) => void;
  onVoteQuotaChange?: (voteQuota: CurrentUserVoteQuota) => void;
}

export function useSuggestionVote({
  projectId,
  suggestionId,
  initialScore,
  initialUserVote,
  voteQuota,
  onVoteSuccess,
  onVoteQuotaChange,
}: UseSuggestionVoteProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<VoteType | null>(initialUserVote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = useCallback(
    async (voteType: VoteType | null) => {
      if (loading) return;

      const isCreatingVote = voteType !== null && userVote === null;

      if (
        isCreatingVote &&
        voteQuota !== null &&
        voteQuota !== undefined &&
        voteQuota.votesRemaining <= 0
      ) {
        setError('Лимит голосов исчерпан');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Сохраняем старое состояние для возможности отката
      const prevScore = score;
      const prevVote = userVote;

      // Оптимистичное обновление (обновляем кнопку не дожидаясь ответа сервера)
      if (voteType === null) {
        // Отмена голоса
        setScore(
          prevVote === 'Up'
            ? prevScore - 1
            : prevVote === 'Down'
              ? prevScore + 1
              : prevScore,
        );
        setUserVote(null);
      } else if (voteType === prevVote) {
        // Переключение того же голоса (отмена)
        setScore(prevVote === 'Up' ? prevScore - 1 : prevScore + 1);
        setUserVote(null);
      } else {
        // Новый голос или смена
        const delta =
          prevVote === 'Up'
            ? -2
            : prevVote === 'Down'
              ? 2
              : voteType === 'Up'
                ? 1
                : -1;
        setScore(prevScore + delta);
        setUserVote(voteType);
      }

      setLoading(true);
      setError(null);

      try {
        // Отправляем реальный запрос на сервер
        const result: VoteResponse =
          voteType === null
            ? await deleteVote(projectId, suggestionId)
            : await voteSuggestion(projectId, suggestionId, { voteType });

        // Синхронизация с сервером
        setScore(result.score);
        setUserVote(result.currentUserVote);

        if (result.voteQuota) {
          onVoteQuotaChange?.(result.voteQuota);
        }

        onVoteSuccess?.(result);
      } catch (err: unknown) {
        // Откат оптимистичного обновления при ошибке
        setScore(prevScore);
        setUserVote(prevVote);
        const updatedQuota = getVoteQuotaFromError(err);
        if (updatedQuota) {
          onVoteQuotaChange?.(updatedQuota);
        }
        setError(
          isVoteLimitExceededError(err)
            ? 'Лимит голосов исчерпан'
            : 'Не удалось отправить голос',
        );
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      onVoteQuotaChange,
      onVoteSuccess,
      projectId,
      score,
      suggestionId,
      userVote,
      voteQuota,
    ],
  );

  return { score, userVote, loading, error, handleVote };
}
