// SettingsModal.tsx
import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { deleteProjectApi } from '../../shared/api/project';
import styles from '../SettingsModal/SettingsModal.module.css';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  projectDescription: string;
  onDeleted?: () => void | Promise<void>;
}

export function SettingsModal({
  open,
  onClose,
  projectId,
  projectName,
  projectDescription,
  onDeleted,
}: SettingsModalProps) {
  const [name, setName] = useState(projectName);
  const [description, setDescription] = useState(projectDescription);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Синхронизируем состояние при открытии
  useEffect(() => {
    if (open) {
      setName(projectName);
      setDescription(projectDescription);
      setError(null);
    }
  }, [open, projectName, projectDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // TODO: PATCH /api/v1/projects/{projectId}
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    onClose();
  };

  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      `Удалить проект "${projectName}"? Это действие нельзя будет отменить.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError(null);
      await deleteProjectApi(projectId);
      await onDeleted?.();
    } catch {
      setError('Не удалось удалить проект');
    } finally {
      setDeleting(false);
    }
  };

  const busy = loading || deleting;

  return (
    <Modal isOpen={open} onClose={onClose} title="Настройки проекта" size="lg">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>ID проекта</label>
          <input
            type="text"
            value={projectId}
            disabled
            className={styles.disabled}
          />
        </div>

        <div className={styles.field}>
          <label>Название проекта</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите название проекта"
          />
        </div>

        <div className={styles.field}>
          <label>Описание</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание прокта"
          />
        </div>

        <div className={styles.futureScope}>
          <h4>[Future Scope]</h4>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Лимит голосов</label>
              <input type="number" value="3" disabled />
            </div>
            <div className={styles.field}>
              <label>Период сброса (дней)</label>
              <input type="number" value="14" disabled />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={busy}
            type="button"
          >
            Отмена
          </Button>
          <Button variant="primary" disabled={busy} type="submit">
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>

        <div className={styles.dangerZone}>
          <div>
            <h4>Удаление проекта</h4>
            <p>
              Проект будет удален для всех участников после подтверждения на
              сервере.
            </p>
          </div>
          <Button
            variant="danger"
            disabled={busy}
            onClick={handleDeleteProject}
            type="button"
          >
            {deleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}
      </form>
    </Modal>
  );
}
