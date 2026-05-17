// SettingsModal.tsx
import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import {
  deleteProjectApi,
  updateProjectApi,
  updateProjectSettingsApi,
} from '../../shared/api/project';
import type { ProjectSummary, ProjectVoteSettings } from '../../types/api';
import styles from '../SettingsModal/SettingsModal.module.css';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  projectDescription: string;
  voteSettings: ProjectVoteSettings | null;
  onProjectSaved?: (project: ProjectSummary) => void | Promise<void>;
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
  onProjectSaved,
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

  const clearError = () => {
    if (error) {
      setError(null);
    }
  };

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
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError('Название проекта обязательно!');
      return;
    }

    if (
      !Number.isInteger(parsedVotesPerUser) ||
      parsedVotesPerUser < 1 ||
      !Number.isInteger(parsedVoteResetPeriodDays) ||
      parsedVoteResetPeriodDays < 1
    ) {
      setError('Лимит и период сброса должны быть целыми числами больше 0');
      return;
    }

    const projectChanged =
      trimmedName !== projectName || trimmedDescription !== projectDescription;

    const settingsChanged =
      parsedVotesPerUser !== voteSettings?.votesPerUser ||
      parsedVoteResetPeriodDays !== voteSettings?.voteResetPeriodDays;

    try {
      let updatedProject: ProjectSummary | null = null;
      let updatedSettings: ProjectVoteSettings | null = null;

      setLoading(true);
      setError(null);

      if (projectChanged) {
        updatedProject = await updateProjectApi(projectId, {
          name: trimmedName,
          description: trimmedDescription,
        });
      }

      if (settingsChanged) {
        updatedSettings = await updateProjectSettingsApi(projectId, {
          votesPerUser: parsedVotesPerUser,
          voteResetPeriodDays: parsedVoteResetPeriodDays,
        });
      }

      if (updatedProject) {
        await onProjectSaved?.(updatedProject);
      }

      if (updatedSettings) {
        await onSettingsSaved?.(updatedSettings);
      }

      onClose();
    } catch (err: unknown) {
      const response = (
        err as { response?: { status?: number; data?: { title?: string } } }
      )?.response;
      const status = response?.status;
      const isDuplicateName =
        status === 409 ||
        response?.data?.title === 'Project with this name already exists.';

      setError(
        status === 403
          ? 'Недостаточно прав для изменения настроек'
          : isDuplicateName
            ? 'Проект с таким названием уже существует'
            : 'Не удалось сохранить настройки проекта',
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
            onChange={(e) => {
              setName(e.target.value);
              clearError();
            }}
            placeholder="Введите название проекта"
            disabled={busy}
          />
        </div>

        <div className={styles.field}>
          <label>Описание</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearError();
            }}
            placeholder="Введите описание проекта"
            disabled={busy}
          />
        </div>

        {error && (
          <p className={styles.errorText} role="alert" aria-live="polite">
            {error}
          </p>
        )}

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
      </form>
    </Modal>
  );
}
