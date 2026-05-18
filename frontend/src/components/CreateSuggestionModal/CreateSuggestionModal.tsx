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
import styles from '../CreateSuggestionModal/CreateSuggestionModal.module.css';

interface CreateSuggestionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (draftId?: string) => void; // теперь передаём draftId наружу
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
    if (!open || !initialDraftId) return;
    apiClient
      .get(`/projects/${projectId}/drafts`)
      .then((res) => {
        const draft = res.data.items?.find(
          (d: { id: string }) => d.id === initialDraftId,
        );
        if (draft?.payload?.text) {
          setText(draft.payload.text);
        }
      })
      .catch(() => {
        // черновик не найден — начинаем с пустого поля
      });
  }, [open, initialDraftId, projectId]);

  // Сброс при закрытии
  useEffect(() => {
    if (!open) {
      setText('');
      setToastOpen(false);
      setSaveStatus('idle');
      draftIdRef.current = initialDraftId ?? null;
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    }
  }, [open, initialDraftId]);

  const saveDraft = useCallback(
    async (value: string) => {
      if (!value.trim()) return;
      setSaveStatus('saving');
      const draftId = draftIdRef.current ?? crypto.randomUUID();
      draftIdRef.current = draftId;
      try {
        await apiClient.put(
          `/projects/${projectId}/drafts/suggestion/${draftId}`,
          { text: value },
        );
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
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
    }
    await saveDraft(text);
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

      // 1. Создаём предложение
      await apiClient.post(`/projects/${projectId}/suggestions`, {
        text: text.trim(),
      });

      // Удаляем черновик после успешной публикации
      if (draftIdRef.current) {
        await deleteDraft(projectId, draftIdRef.current).catch(() => {
          // Не критично, если не удалился
        });
      }

      onSuccess();
    } catch (err: unknown) {
      showError(getSuggestionCreateErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const saveStatusLabel: Record<SaveStatus, string> = {
    idle: '[*] Черновик сохраняется автоматически',
    saving: '[*] Сохранение...',
    saved: '[*] Черновик сохранён',
    error: '[!] Не удалось сохранить черновик',
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
