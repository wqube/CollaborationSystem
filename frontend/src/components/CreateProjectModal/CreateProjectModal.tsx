import { useState } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { createProjectApi } from '../../shared/api/project';
import { Toast } from '../ui/Toast/Toast';
import styles from './CreateProjectModal.module.css';
import { Button } from '../ui/Button/Button';
import { getProjectCreateErrorMessage } from '../../shared/api/errors';

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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  const showError = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleClose = () => {
    setToastOpen(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Название обязательно');
      return;
    }

    try {
      setSubmitting(true);
      setToastOpen(false);

      const project = await createProjectApi({
        name: name.trim(),
        description: description.trim(),
      });

      setName('');
      setDescription('');
      onSuccess(project.id);
    } catch (err: unknown) {
      showError(getProjectCreateErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={handleClose} title="Новый проект" size="md">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            placeholder="Введите название проекта"
            required
          />
        </div>
        <div className={styles.field}>
          <label>Описание</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            placeholder="Введите описание"
          />
        </div>
        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={handleClose}
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
      <Toast
        open={toastOpen}
        message={toastMessage}
        variant="error"
        onClose={() => setToastOpen(false)}
      />
    </Modal>
  );
}
