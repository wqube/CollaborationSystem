// SettingsModal.tsx
import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import {
  deleteProjectApi,
  updateProjectSettingsApi,
} from '../../shared/api/project';
import type { ProjectVoteSettings } from '../../types/api';
import styles from '../SettingsModal/SettingsModal.module.css';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  projectDescription: string;
  voteSettings: ProjectVoteSettings | null;
  onDeleted?: () => void | Promise<void>;
  onSettingsSaved?: (settings: ProjectVoteSettings) => void | Promise<void>;
}

export function SettingsModal({
  open,
  onClose,
  projectId,
  projectName,
  projectDescription,
  voteSettings,
  onDeleted,
  onSettingsSaved,
}: SettingsModalProps) {
  const [name, setName] = useState(projectName);
  const [description, setDescription] = useState(projectDescription);
  const [votesPerUser, setVotesPerUser] = useState(
    String(voteSettings?.votesPerUser ?? 3),
  );
  const [voteResetPeriodDays, setVoteResetPeriodDays] = useState(
    String(voteSettings?.voteResetPeriodDays ?? 14),
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Синхронизируем состояние при открытии
  useEffect(() => {
    if (open) {
      setName(projectName);
      setDescription(projectDescription);
      setVotesPerUser(String(voteSettings?.votesPerUser ?? 3));
      setVoteResetPeriodDays(String(voteSettings?.voteResetPeriodDays ?? 14));
      setError(null);
    }
  }, [open, projectName, projectDescription, voteSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVotesPerUser = Number(votesPerUser);
    const parsedVoteResetPeriodDays = Number(voteResetPeriodDays);

    if (
      !Number.isInteger(parsedVotesPerUser) ||
      parsedVotesPerUser < 1 ||
      !Number.isInteger(parsedVoteResetPeriodDays) ||
      parsedVoteResetPeriodDays < 1
    ) {
      setError('Лимит и период сброса должны быть целыми числами больше 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedSettings = await updateProjectSettingsApi(projectId, {
        votesPerUser: parsedVotesPerUser,
        voteResetPeriodDays: parsedVoteResetPeriodDays,
      });
      await onSettingsSaved?.(updatedSettings);
      onClose();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      setError(
        status === 403
          ? 'Недостаточно прав для изменения настроек'
          : 'Не удалось сохранить настройки',
      );
    } finally {
      setLoading(false);
    }
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
            placeholder="Введите название проекта"
            disabled
            readOnly
            className={styles.disabled}
          />
        </div>

        <div className={styles.field}>
          <label>Описание</label>
          <textarea
            rows={3}
            value={description}
            placeholder="Введите описание проекта"
            disabled
            readOnly
            className={styles.disabled}
          />
        </div>

        <div className={styles.settingsBlock}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Лимит голосов</label>
              <input
                type="number"
                min={1}
                step={1}
                value={votesPerUser}
                onChange={(e) => setVotesPerUser(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className={styles.field}>
              <label>Период сброса (дней)</label>
              <input
                type="number"
                min={1}
                step={1}
                value={voteResetPeriodDays}
                onChange={(e) => setVoteResetPeriodDays(e.target.value)}
                disabled={busy}
              />
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
