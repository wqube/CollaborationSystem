import type { VoteType } from '../../types/api';
import { VoteButton } from '../ui/VoteButton/VoteButton';
import styles from './VoteButtonGroup.module.css';

interface VoteButtonGroupProps {
  score: number;
  userVote: VoteType | null;
  onVote: (type: VoteType | null) => void;
  loading?: boolean;
  size?: 'sm' | 'lg';
}

export function VoteButtonGroup({
  score,
  userVote,
  onVote,
  loading = false,
  size = 'sm',
}: VoteButtonGroupProps) {
  return (
    <div className={`${styles.voteGroup} ${styles[size]}`}>
      <VoteButton
        type="up"
        size={size}
        active={userVote === 'Up'}
        onClick={() => onVote(userVote === 'Up' ? null : 'Up')}
        disabled={loading}
      />

      <span className={styles.score}>{score}</span>

      <VoteButton
        type="down"
        size={size}
        active={userVote === 'Down'}
        onClick={() => onVote(userVote === 'Down' ? null : 'Down')}
        disabled={loading}
      />
    </div>
  );
}
