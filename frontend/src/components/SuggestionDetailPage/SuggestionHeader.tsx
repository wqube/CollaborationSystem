import { Badge } from '../ui/Badge/Badge';
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
  onStatusChange,
}: SuggestionHeaderProps) {
  const canChangeStatus = canManageProjectSettings(userRole);

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <h1 className={styles.suggestionTitle}>{detail.text}</h1>

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

      <div className={styles.meta}>
        <Badge variant={getBadgeVariant(detail.status)} />
        <span>Автор: {detail.author.displayName}</span>
        <span>Создано: {formatDate(detail.createdAt)}</span>
      </div>

      <p className={styles.description}>{detail.text}</p>
      <div className={styles.meta}>
        id: {detail.id.slice(0, 8)}... | updated: {formatDate(detail.updatedAt)}
      </div>
    </div>
  );
}
