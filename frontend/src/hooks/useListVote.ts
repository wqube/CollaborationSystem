import { useState, useEffect } from 'react';
import {
  getVoteFromCache,
  setVoteToCache,
  type VoteState,
} from '../shared/utils/voteCache';

export function useListVote(suggestionId: string) {
  const [vote, setVote] = useState<VoteState>(null);

  useEffect(() => {
    setVote(getVoteFromCache(suggestionId));
  }, [suggestionId]);

  const handleVote = (newVote: VoteState) => {
    setVote(newVote);
    setVoteToCache(suggestionId, newVote);
  };

  return { vote, handleVote };
}
