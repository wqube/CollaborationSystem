import { useSuggestionVote } from '../../hooks/useSuggestionVote';
import { VoteButtonGroup } from '../VoteButtonGroup/VoteButtonGroup';
import type { CurrentUserVoteQuota, SuggestionSummary } from '../../types/api';

interface SuggestionVoteCellProps {
  projectId: string;
  suggestion: SuggestionSummary;
  voteQuota?: CurrentUserVoteQuota | null;
  onVoteSuccess?: (
    suggestionId: string,
    newScore: number,
    currentUserVote: SuggestionSummary['currentUserVote'],
    voteQuota: CurrentUserVoteQuota,
  ) => void;
  onVoteQuotaChange?: (voteQuota: CurrentUserVoteQuota) => void;
}

export function SuggestionVoteCell({
  projectId,
  suggestion,
  voteQuota,
  onVoteSuccess,
  onVoteQuotaChange,
}: SuggestionVoteCellProps) {
  const { score, userVote, loading, error, handleVote } = useSuggestionVote({
    projectId,
    suggestionId: suggestion.id,
    initialScore: suggestion.score,
    initialUserVote: suggestion.currentUserVote ?? null,
    voteQuota,
    onVoteQuotaChange,
    onVoteSuccess: (response) => {
      onVoteSuccess?.(
        suggestion.id,
        response.score,
        response.currentUserVote,
        response.voteQuota,
      );
    },
  });

  return (
    <VoteButtonGroup
      score={score}
      userVote={userVote}
      onVote={handleVote}
      voteQuota={voteQuota}
      loading={loading}
      error={error}
      size="sm"
    />
  );
}
