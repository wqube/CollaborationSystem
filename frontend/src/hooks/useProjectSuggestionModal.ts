import { useCallback, useState } from 'react';

interface UseProjectSuggestionModalParams {
  isDraftsTab: boolean;
  refreshSuggestions: () => Promise<void>;
}

export function useProjectSuggestionModal({
  isDraftsTab,
  refreshSuggestions,
}: UseProjectSuggestionModalParams) {
  const [open, setOpen] = useState(false);
  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const [draftsRefreshKey, setDraftsRefreshKey] = useState(0);

  const openNewSuggestion = useCallback(() => {
    setDraftId(undefined);
    setOpen(true);
  }, []);

  const continueDraft = useCallback((nextDraftId: string) => {
    setDraftId(nextDraftId);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setDraftId(undefined);
  }, []);

  const handleSuccess = useCallback(
    (publishedDraftId?: string) => {
      close();

      if (publishedDraftId) {
        setDraftsRefreshKey((prev) => prev + 1);
      }

      if (!isDraftsTab) {
        void refreshSuggestions();
      }
    },
    [close, isDraftsTab, refreshSuggestions],
  );

  return {
    open,
    draftId,
    draftsRefreshKey,
    openNewSuggestion,
    continueDraft,
    close,
    handleSuccess,
  };
}
