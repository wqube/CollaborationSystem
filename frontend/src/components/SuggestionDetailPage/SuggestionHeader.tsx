import { useEffect, useState } from 'react';
import { Badge } from '../ui/Badge/Badge';
import { Button } from '../ui/Button/Button';
import type {
  ProjectRole,
  SuggestionDetails,
  SuggestionStatus,
} from '../../types/api';
import { canManageProjectSettings } from '../../shared/utils/projectRole';
import styles from '../../assets/SuggestionDetailPage.module.css';

interface SuggestionHeaderProps {
  detail: SuggestionDetails;
  userRole: ProjectRole;
  canEditText: boolean;
  onTextChange: (text: string) => Promise<void>;
  onStatusChange: (status: SuggestionStatus) => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

const getBadgeVariant = (s: SuggestionStatus) => {
  switch (s) {
    case 'New':
      return 'new';
    case 'InProgress':
      return 'progress';
    case 'Accepted':
      return 'accepted';
    case 'Rejected':
      return 'rejected';
    default:
      return 'new';
  }
};

export function SuggestionHeader({
  detail,
  userRole,
  canEditText,
  onTextChange,
  onStatusChange,
}: SuggestionHeaderProps) {
  const canChangeStatus = canManageProjectSettings(userRole);
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(detail.text);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      setDraftText(detail.text);
      setEditError(null);
    }
  }, [detail.text, editing]);

  const trimmedDraft = draftText.trim();
  const canSave =
    trimmedDraft.length > 0 && trimmedDraft !== detail.text.trim() && !saving;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSave) return;

    try {
      setSaving(true);
      setEditError(null);
      await onTextChange(trimmedDraft);
      setEditing(false);
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : 'Не удалось сохранить текст',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setDraftText(detail.text);
    setEditError(null);
  };

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <h1 className={styles.suggestionTitle}>{detail.text}</h1>

        <div className={styles.headerActions}>
          {canEditText && !editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              Редактировать
            </Button>
          )}

          <select
            className={styles.statusSelect}
            value={detail.status}
            onChange={(e) => onStatusChange(e.target.value as SuggestionStatus)}
            disabled={!canChangeStatus}
            title={
              !canChangeStatus
                ? 'Только администраторы могут менять статус'
                : 'Изменить статус'
            }
          >
            <option value="New">New</option>
            <option value="InProgress">InProgress</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className={styles.meta}>
        <Badge variant={getBadgeVariant(detail.status)} />
        <span>Автор: {detail.author.displayName}</span>
        <span>Создано: {formatDate(detail.createdAt)}</span>
      </div>

      {editing ? (
        <form className={styles.suggestionEditForm} onSubmit={handleSubmit}>
          <textarea
            className={styles.suggestionEditInput}
            value={draftText}
            rows={4}
            maxLength={2000}
            onChange={(event) => setDraftText(event.target.value)}
            disabled={saving}
            autoFocus
          />

          <div className={styles.suggestionEditActions}>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleCancel}
              disabled={saving}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!canSave}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>

          {editError && <p className={styles.inlineError}>{editError}</p>}
        </form>
      ) : (
        <p className={styles.description}>{detail.text}</p>
      )}
      <div className={styles.meta}>
        id: {detail.id.slice(0, 8)}... | updated: {formatDate(detail.updatedAt)}
      </div>
    </div>
  );
}
