// components/CreateSuggestionModal/CreateSuggestionModal.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { Toast } from '../ui/Toast/Toast';
import {
  saveSuggestionDraft,
  getProjectDrafts,
  deleteDraft,
  findDraftById,
} from '../../shared/api/drafts';
import { createSuggestion } from '../../shared/api/suggestions';
import { getSuggestionCreateErrorMessage } from '../../shared/api/errors';
import { createUuid } from '../../shared/utils/createUuid';
import styles from '../CreateSuggestionModal/CreateSuggestionModal.module.css';

interface CreateSuggestionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (draftId?: string) => void;
  projectId: string;
  draftId?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DELAY_MS = 1500;

export function CreateSuggestionModal({
  open,
  onClose,
  onSuccess,
  projectId,
  draftId: initialDraftId,
}: CreateSuggestionModalProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  const draftIdRef = useRef<string | null>(initialDraftId ?? null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  // Загрузка черновика при открытии
  useEffect(() => {
    if (!open) return;

    draftIdRef.current = initialDraftId ?? null;

    if (!initialDraftId) {
      setText('');
      setSaveStatus('idle');
      return;
    }

    let cancelled = false;

    const loadDraft = async () => {
      try {
        const drafts = await getProjectDrafts(projectId, {
          type: 'Suggestion',
        });
        const draft = findDraftById(drafts.items, initialDraftId);

        if (!cancelled && draft?.type === 'Suggestion') {
          setText(draft.payload.text);
          setSaveStatus('saved');
        }
      } catch {
        // черновик не найден — начинаем с пустого поля
        if (!cancelled) {
          setText('');
          setSaveStatus('idle');
        }
      }
    };

    loadDraft();

    return () => {
      cancelled = true;
    };
  }, [open, initialDraftId, projectId]);

  // Сброс при закрытии
  useEffect(() => {
    if (!open) {
      setText('');
      setToastOpen(false);
      setSaveStatus('idle');
      draftIdRef.current = null;
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    }
  }, [open]);

  const saveDraft = useCallback(
    async (value: string) => {
      if (!value.trim()) return null;

      setSaveStatus('saving');
      const draftId = draftIdRef.current ?? createUuid();
      draftIdRef.current = draftId;

      try {
        await saveSuggestionDraft(projectId, draftId, { text: value });
        setSaveStatus('saved');
        return draftId;
      } catch {
        setSaveStatus('error');
        return null;
      }
    },
    [projectId],
  );

  const handleTextChange = (value: string) => {
    setText(value);
    setSaveStatus('idle');
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      saveDraft(value);
    }, AUTOSAVE_DELAY_MS);
  };

  const handleSaveDraftAndClose = async () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    const savedDraftId = await saveDraft(text);

    if (!savedDraftId) {
      showError('Не удалось сохранить черновик');
      return;
    }

    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      showError('Введите текст предложения');
      return;
    }

    try {
      setLoading(true);
      setToastOpen(false);

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }

      const publishedDraftId = draftIdRef.current ?? undefined;

      await createSuggestion(projectId, {
        text: text.trim(),
      });

      // Удаляем черновик после успешной публикации
      if (publishedDraftId) {
        await deleteDraft(projectId, publishedDraftId).catch(() => {
          // Не критично, если не удалился
        });
      }

      draftIdRef.current = null;
      setText('');
      setSaveStatus('idle');
      onSuccess(publishedDraftId);
    } catch (err: unknown) {
      showError(getSuggestionCreateErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const saveStatusLabel: Record<SaveStatus, string> = {
    idle: 'Черновик сохраняется автоматически',
    saving: 'Сохранение...',
    saved: 'Черновик сохранён',
    error: 'Не удалось сохранить черновик',
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Новое предложение" size="lg">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Текст предложения</label>
          <textarea
            rows={6}
            value={text}
            onChange={(e) => {
              handleTextChange(e.target.value);
            }}
            placeholder="Опишите ваше предложение по улучшению процесса..."
            required
          />
        </div>

        <div
          className={`${styles.draftInfo} ${saveStatus === 'error' ? styles.draftError : ''}`}
        >
          {saveStatusLabel[saveStatus]}
        </div>

        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            Отмена
          </Button>
          <Button
            variant="secondary"
            disabled={loading || !text.trim()}
            type="button"
            onClick={handleSaveDraftAndClose}
          >
            Сохранить черновик
          </Button>
          <Button variant="primary" disabled={loading} type="submit">
            {loading ? 'Создание...' : 'Опубликовать'}
          </Button>
        </div>
      </form>
      <Toast
        open={toastOpen}
        message={toastMessage}
        variant="error"
        onClose={() => setToastOpen(false)}
      />
    </Modal>
  );
}
