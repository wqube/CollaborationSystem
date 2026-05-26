import { useState, useRef, useCallback, useEffect } from 'react';
import {
  saveCommentDraft,
  getProjectDrafts,
  deleteDraft,
  findCommentDraft,
} from '../shared/api/drafts';

const AUTOSAVE_DELAY_MS = 1500;
const SAVED_STATUS_VISIBLE_MS = 2000;

export function useCommentDraft(
  projectId: string,
  suggestionId: string,
  parentCommentId: string | null,
) {
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearSavedStatusTimer = useCallback(() => {
    if (savedStatusTimerRef.current) {
      clearTimeout(savedStatusTimerRef.current);
      savedStatusTimerRef.current = null;
    }
  }, []);

  // Загрузка существующего черновика при монтировании
  useEffect(() => {
    let cancelled = false;
    const loadDraft = async () => {
      try {
        const response = await getProjectDrafts(projectId, {
          type: 'Comment',
          pageSize: 100,
        });

        const draft = findCommentDraft(
          response.items,
          suggestionId,
          parentCommentId,
        );
        if (draft && !cancelled) {
          setDraftId(draft.id);
          setDraftText(draft.payload.text || '');
        }
      } catch {
        // Черновик не найден или ошибка сети
      }
    };
    loadDraft();
    return () => {
      cancelled = true;
    };
  }, [projectId, suggestionId, parentCommentId]);

  // Обработчик изменения текста с debounce
  const handleTextChange = useCallback(
    (text: string) => {
      setDraftText(text);
      setSaveStatus('idle');
      clearSavedStatusTimer();

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        if (!text.trim()) return;
        setSaveStatus('saving');
        const currentDraftId = draftId || crypto.randomUUID();
        try {
          await saveCommentDraft(projectId, currentDraftId, {
            suggestionId,
            parentCommentId,
            text,
          });
          if (!draftId) setDraftId(currentDraftId);
          setSaveStatus('saved');
          clearSavedStatusTimer();
          savedStatusTimerRef.current = setTimeout(() => {
            setSaveStatus('idle');
            savedStatusTimerRef.current = null;
          }, SAVED_STATUS_VISIBLE_MS);
        } catch {
          clearSavedStatusTimer();
          setSaveStatus('error');
        }
      }, AUTOSAVE_DELAY_MS);
    },
    [projectId, suggestionId, parentCommentId, draftId, clearSavedStatusTimer],
  );

  // Очистка черновика после успешной отправки
  const clearDraft = useCallback(async () => {
    if (draftId) {
      await deleteDraft(projectId, draftId).catch(() => {});
    }
    setDraftId(null);
    setDraftText('');
    setSaveStatus('idle');
    if (timerRef.current) clearTimeout(timerRef.current);
    clearSavedStatusTimer();
  }, [projectId, draftId, clearSavedStatusTimer]);

  // Очистка таймера при размонтировании
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearSavedStatusTimer();
    },
    [clearSavedStatusTimer],
  );

  const statusLabel: Record<typeof saveStatus, string> = {
    idle: '',
    saving: 'Сохранение...',
    saved: 'Черновик сохранён',
    error: 'Ошибка сохранения',
  };

  return {
    draftText,
    saveStatus,
    statusLabel: statusLabel[saveStatus],
    handleTextChange,
    clearDraft,
    setDraftText,
  };
}
