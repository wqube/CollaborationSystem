import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button/Button';
import apiClient from '../../shared/api/client';
import styles from './DraftsTab.module.css';

interface DraftDto {
  id: string;
  projectId: string;
  type: 'Suggestion' | 'Comment';
  payload:
    | { text: string }
    | { suggestionId: string; parentCommentId: string | null; text: string };
  updatedAt: string;
}

interface DraftsTabProps {
  projectId: string;
  onContinue: (draftId: string) => void;
  refreshTrigger?: number;
}

export function DraftsTab({
  projectId,
  onContinue,
  refreshTrigger,
}: DraftsTabProps) {
  const [drafts, setDrafts] = useState<DraftDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ items: DraftDto[] }>(
        `/projects/${projectId}/drafts?type=Suggestion`,
      );
      setDrafts(res.data.items);
    } catch {
      setError('Не удалось загрузить черновики');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts, refreshTrigger]);

  const handleDelete = async (draftId: string) => {
    try {
      await apiClient.delete(`/projects/${projectId}/drafts/${draftId}`);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    } catch {
      setError('Не удалось удалить черновик');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  if (loading) return <p className={styles.state}>Загрузка...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.table}>
      <table>
        <thead>
          <tr>
            <th>Текст черновика</th>
            <th>Дата изменения</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {drafts.length === 0 && (
            <tr>
              <td colSpan={3} className={styles.empty}>
                Черновиков нет
              </td>
            </tr>
          )}
          {drafts.map((draft) => (
            <tr key={draft.id}>
              <td>
                <strong className={styles.suggestionText}>
                  {draft.payload.text && typeof draft.payload.text === 'string'
                    ? draft.payload.text
                    : '—'}
                </strong>
              </td>
              <td>{formatDate(draft.updatedAt)}</td>
              <td>
                <div className={styles.actions}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onContinue(draft.id)}
                  >
                    Продолжить
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(draft.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
