import { useCallback, useEffect, useState } from 'react';
import { getSuggestions } from '../shared/api/suggestions';
import type {
  CurrentUserVoteQuota,
  OrderSort,
  SuggestionSort,
  SuggestionStatus,
  SuggestionSummary,
} from '../types/api';

export type StatusFilter = SuggestionStatus | 'drafts' | '';

interface UseProjectSuggestionsParams {
  projectId: string | undefined;
  pageSize: number;
  onVoteQuotaChange: (voteQuota: CurrentUserVoteQuota) => void;
}

export function useProjectSuggestions({
  projectId,
  pageSize,
  onVoteQuotaChange,
}: UseProjectSuggestionsParams) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('New');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SuggestionSort>('score');
  const [order, setOrder] = useState<OrderSort>('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [suggestions, setSuggestions] = useState<SuggestionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDraftsTab = statusFilter === 'drafts';

  const refreshSuggestions = useCallback(async () => {
    if (!projectId || isDraftsTab) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getSuggestions(projectId, {
        status: statusFilter || undefined,
        search: search || undefined,
        sort,
        order,
        page,
        pageSize,
      });
      setSuggestions(data.items);
      setTotal(data.total);
    } catch {
      setError('Не удалось загрузить предложения');
    } finally {
      setLoading(false);
    }
  }, [
    projectId,
    isDraftsTab,
    statusFilter,
    search,
    sort,
    order,
    page,
    pageSize,
  ]);

  useEffect(() => {
    void refreshSuggestions();
  }, [refreshSuggestions]);

  const handleTabChange = useCallback((tab: string) => {
    if (tab === 'drafts') {
      setStatusFilter('drafts');
      return;
    }

    setStatusFilter(tab as StatusFilter);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: SuggestionSort) => {
    setSort(value);
    setPage(1);
  }, []);

  const handleOrderChange = useCallback((value: OrderSort) => {
    setOrder(value);
    setPage(1);
  }, []);

  const handleVoteSuccess = useCallback(
    (
      id: string,
      newScore: number,
      currentUserVote: SuggestionSummary['currentUserVote'],
      nextVoteQuota: CurrentUserVoteQuota,
    ) => {
      onVoteQuotaChange(nextVoteQuota);

      setSuggestions((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                score: newScore,
                currentUserVote,
              }
            : item,
        ),
      );

      void refreshSuggestions();
    },
    [onVoteQuotaChange, refreshSuggestions],
  );

  return {
    statusFilter,
    search,
    sort,
    order,
    page,
    total,
    totalPages: isDraftsTab ? 1 : Math.ceil(total / pageSize),
    pageSize,
    suggestions,
    loading,
    error,
    isDraftsTab,
    refreshSuggestions,
    setPage,
    handleTabChange,
    handleSearchChange,
    handleStatusChange,
    handleSortChange,
    handleOrderChange,
    handleVoteSuccess,
  };
}

export type ProjectSuggestionsState = ReturnType<typeof useProjectSuggestions>;
