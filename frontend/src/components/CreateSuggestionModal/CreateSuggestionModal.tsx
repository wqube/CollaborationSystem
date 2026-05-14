import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import {
  saveSuggestionDraft,
  getProjectDrafts,
  deleteDraft,
  findDraftById,
} from '../../shared/api/drafts';
import { createSuggestion } from '../../shared/api/suggestions';
import styles from '../CreateSuggestionModal/CreateSuggestionModal.module.css';

interface CreateSuggestionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const draftIdRef = useRef<string | null>(initialDraftId ?? null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Загрузка черновика при открытии
  useEffect(() => {
    if (!open || !initialDraftId) return;

    const loadDraft = async () => {
      try {
        const response = await getProjectDrafts(projectId);
        const draft = findDraftById(response.items, initialDraftId);
        if (draft?.type === 'Suggestion' && draft.payload.text) {
          setText(draft.payload.text);
        }
      } catch {
        // Черновик не найден, чистое поле
      }
    };
    loadDraft();
  }, [open, initialDraftId, projectId]);

  // Сброс состояние при закрытии
  useEffect(() => {
    if (!open) {
      setText('');
      setError('');
      setSaveStatus('idle');
      draftIdRef.current = initialDraftId ?? null;
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    }
  }, [open, initialDraftId]);

  // Сохранение черновика
  const saveDraft = useCallback(
    async (value: string) => {
      if (!value.trim()) return;

      setSaveStatus('saving');

      // Если черновика ещё нет — генерируем новый draftId
      const draftId = draftIdRef.current ?? crypto.randomUUID();
      draftIdRef.current = draftId;

      try {
        await saveSuggestionDraft(projectId, draftId, { text: value });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    },
    [projectId],
  );

  // Автосохранение с debounce
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

  // Сохранение и закрытие
  const handleSaveDraftAndClose = async () => {
    // Отменяем pending автосохранение и сохраняем сразу
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    await saveDraft(text);
    onClose();
  };

  // Публикация предложения
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Введите текст предложения');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Создание предложения
      await createSuggestion(projectId, { text: text.trim() });

      // Удаляем черновик после успешной публикации
      if (draftIdRef.current) {
        await deleteDraft(projectId, draftIdRef.current).catch(() => {
          // Не критично, если не удалился
        });
      }

      onSuccess();
    } catch {
      setError('Ошибка при создании предложения');
    } finally {
      setLoading(false);
    }
  };

  const saveStatusLabel: Record<SaveStatus, string> = {
    idle: 'Черновик сохраняется автоматически',
    saving: 'Сохранение...',
    saved: 'Черновик сохранён',
    error: '! Не удалось сохранить черновик !',
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Новое предложение" size="lg">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Текст предложения</label>
          <textarea
            rows={6}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Опишите ваше предложение по улучшению процесса..."
            required
          />
        </div>

        <div
          className={`${styles.draftInfo} ${saveStatus === 'error' ? styles.draftError : ''}`}
        >
          {saveStatusLabel[saveStatus]}
        </div>

        {error && <div className={styles.error}>{error}</div>}

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
    </Modal>
  );
}
