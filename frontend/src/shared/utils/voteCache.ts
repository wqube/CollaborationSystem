export type VoteState = 'Up' | 'Down' | null;
const CACHE_KEY = 'suggestion_votes_cache';

export const getVoteFromCache = (suggestionId: string): VoteState => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    return cache[suggestionId] ?? null;
  } catch {
    return null;
  }
};

export const setVoteToCache = (suggestionId: string, vote: VoteState) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    if (vote === null) {
      delete cache[suggestionId];
    } else {
      cache[suggestionId] = vote;
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Игнорируем ошибки хранилища (например, в режиме инкогнито)
  }
};
