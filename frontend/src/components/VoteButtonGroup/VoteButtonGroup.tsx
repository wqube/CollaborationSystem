import type { CurrentUserVoteQuota, VoteType } from '../../types/api';
import { VoteButton } from '../ui/VoteButton/VoteButton';
import styles from './VoteButtonGroup.module.css';

interface VoteButtonGroupProps {
  score: number;
  userVote: VoteType | null;
  onVote: (type: VoteType | null) => void;
  voteQuota?: CurrentUserVoteQuota | null;
  loading?: boolean;
  error?: string | null;
  size?: 'sm' | 'lg';
}

export function VoteButtonGroup({
  score,
  userVote,
  onVote,
  voteQuota,
  loading = false,
  error,
  size = 'sm',
}: VoteButtonGroupProps) {
  const limitReached =
    userVote === null &&
    voteQuota !== null &&
    voteQuota !== undefined &&
    voteQuota.votesRemaining <= 0;
  const disabled = loading || limitReached;
  const title = limitReached ? 'Лимит голосов исчерпан' : undefined;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.voteGroup} ${styles[size]}`} title={title}>
        <VoteButton
          type="up"
          size={size}
          active={userVote === 'Up'}
          onClick={() => onVote(userVote === 'Up' ? null : 'Up')}
          disabled={disabled}
        />

        <span className={styles.score}>{score}</span>

        <VoteButton
          type="down"
          size={size}
          active={userVote === 'Down'}
          onClick={() => onVote(userVote === 'Down' ? null : 'Down')}
          disabled={disabled}
        />
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
