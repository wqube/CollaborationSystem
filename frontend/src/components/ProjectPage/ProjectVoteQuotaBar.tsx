import type { CurrentUserVoteQuota } from '../../types/api';
import styles from '../../assets/ProjectPage.module.css';

interface ProjectVoteQuotaBarProps {
  voteQuota: CurrentUserVoteQuota | null;
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export function ProjectVoteQuotaBar({ voteQuota }: ProjectVoteQuotaBarProps) {
  if (!voteQuota) return null;

  return (
    <div className={styles.quotaBar}>
      <span>
        Голоса: {voteQuota.votesRemaining} из {voteQuota.votesLimit}
      </span>
      <span>Сброс: {formatDateTime(voteQuota.nextResetAt)}</span>
    </div>
  );
}
