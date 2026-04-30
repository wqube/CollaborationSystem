// src/pages/ProjectPage/components/CreateSuggestionModal/CreateSuggestionModal.tsx
import { useState } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import styles from '../CreateSuggestionModal/CreateSuggestionModal.module.css';

interface CreateSuggestionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
}

export function CreateSuggestionModal({
  open,
  onClose,
  onSuccess,
  projectId,
}: CreateSuggestionModalProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Введите текст предложения');
      return;
    }
    try {
      setLoading(true);
      setError('');
      // TODO: POST /api/v1/projects/{projectId}/suggestions
      await new Promise((r) => setTimeout(r, 500));
      onSuccess();
    } catch {
      setError('Ошибка при создании предложения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Новое предложение" size="lg">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Текст предложения</label>
          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Опишите ваше предложение по улучшению процесса..."
            required
          />
        </div>
        <div className={styles.draftInfo}>[*] Draft will be auto-saved</div>
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
          <Button variant="secondary" disabled={loading} type="button">
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
