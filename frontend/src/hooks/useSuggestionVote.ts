import { useState, useCallback } from 'react';
import {
  voteSuggestion,
  deleteVote,
  type VoteResponse,
} from '../shared/api/suggestions';
import type { VoteType } from '../types/api';
import { getVoteFromCache, setVoteToCache } from '../shared/utils/voteCache';
interface UseSuggestionVoteProps {
  projectId: string;
  suggestionId: string;
  initialScore: number;
  initialUserVote: VoteType | null;
  onVoteSuccess?: (newScore: number) => void;
}

export function useSuggestionVote({
  projectId,
  suggestionId,
  initialScore,
  initialUserVote,
  onVoteSuccess,
}: UseSuggestionVoteProps) {
  const cachedVote = getVoteFromCache(suggestionId);
  const resolvedInitialVote = initialUserVote ?? cachedVote;

  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<VoteType | null>(
    resolvedInitialVote,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = useCallback(
    async (voteType: VoteType | null) => {
      if (loading) return;

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

        setVoteToCache(suggestionId, result.currentUserVote);
        onVoteSuccess?.(result.score);
      } catch {
        // Откат оптимистичного обновления при ошибке
        setScore(prevScore);
        setUserVote(prevVote);
        setError('Не удалось отправить голос');
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    },
    [projectId, suggestionId, score, userVote, loading, onVoteSuccess],
  );

  return { score, userVote, loading, error, handleVote };
}
