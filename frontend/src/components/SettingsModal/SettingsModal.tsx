import { useState } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import styles from '../SettingsModal/SettingsModal.module.css';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  projectDescription: string;
}

export function SettingsModal({
  open,
  onClose,
  projectId,
  projectName,
  projectDescription,
}: SettingsModalProps) {
  const [name, setName] = useState(projectName);
  const [description, setDescription] = useState(projectDescription);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: PATCH /api/v1/projects/{projectId}
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    onClose();
  };

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
          />
        </div>
        <div className={styles.field}>
          <label>Описание</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            disabled={loading}
            type="button"
          >
            Отмена
          </Button>
          <Button variant="primary" disabled={loading} type="submit">
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
