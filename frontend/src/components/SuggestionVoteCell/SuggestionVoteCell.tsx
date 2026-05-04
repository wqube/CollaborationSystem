import { useSuggestionVote } from '../../hooks/useSuggestionVote';
import { VoteButtonGroup } from '../VoteButtonGroup/VoteButtonGroup';
import type { SuggestionSummary } from '../../types/api';

interface SuggestionVoteCellProps {
  projectId: string;
  suggestion: SuggestionSummary;
  onVoteSuccess?: (suggestionId: string, newScore: number) => void;
}

export function SuggestionVoteCell({
  projectId,
  suggestion,
  onVoteSuccess,
}: SuggestionVoteCellProps) {
  const { score, userVote, loading, handleVote } = useSuggestionVote({
    projectId,
    suggestionId: suggestion.id,
    initialScore: suggestion.score,
    initialUserVote: suggestion.currentUserVote ?? null,
    onVoteSuccess: (newScore) => {
      onVoteSuccess?.(suggestion.id, newScore);
    },
  });

  return (
    <VoteButtonGroup
      score={score}
      userVote={userVote}
      onVote={handleVote}
      loading={loading}
      size="sm"
    />
  );
}
