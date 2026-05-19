import { Badge } from '../ui/Badge/Badge';
import type { UserDto } from '../../types/api';
import styles from '../../assets/ProfilePage.module.css';

interface ProfileSummaryCardProps {
  user: UserDto | null;
}

const getInitials = (displayName: string | undefined) =>
  displayName
    ?.split(' ')
    .map((word) => word[0])
    .join('') || '?';

export function ProfileSummaryCard({ user }: ProfileSummaryCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>{getInitials(user?.displayName)}</div>
        <div>
          <h2>{user?.displayName || 'Гость'}</h2>
          <p className={styles.email}>{user?.email || 'неизвестно'}</p>
          <Badge variant="new">DevLogin</Badge>
        </div>
      </div>
      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span>User ID</span>
          <span>{user?.id || '—'}</span>
        </div>
        <div className={styles.detailItem}>
          <span>Auth Mode</span>
          <span>DevLogin</span>
        </div>
      </div>
    </div>
  );
}
