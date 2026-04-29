import { useState } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { useAppDispatcher } from '../../shared/store/hooks';
import { createProject } from '../../shared/store/projectsSlice';
import styles from './CreateProjectModal.module.css';
import { Button } from '../ui/Button/Button';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
}

export function CreateProjectModal({
  open,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const dispatch = useAppDispatcher();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Название обязательно');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const resultAction = await dispatch(
        createProject({ name: name.trim(), description: description.trim() }),
      );
      if (createProject.fulfilled.match(resultAction)) {
        onSuccess(resultAction.payload.id);
      } else {
        setError('Ошибка при создании проекта');
      }
    } catch {
      setError('Ошибка при создании проекта');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Новый проект" size="md">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите название проекта"
            required
          />
        </div>
        <div className={styles.field}>
          <label>Описание</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание"
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            type="button"
          >
            Отмена
          </Button>
          <Button variant="primary" disabled={submitting} type="submit">
            {submitting ? 'Создание...' : 'Создать'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
