import { Button } from '../ui/Button/Button';
import { VoteButton } from '../ui/VoteButton/VoteButton';
import type { SuggestionDetails, VoteType } from '../../types/api';
import styles from '../../assets/SuggestionDetailPage.module.css';

interface VotePanelProps {
  detail: SuggestionDetails;
  loading: boolean;
  onVote: (type: VoteType | null) => Promise<void>;
}

export function VotePanel({ detail, loading, onVote }: VotePanelProps) {
  return (
    <div className={styles.card}>
      <h3>Голосование</h3>

      <div className={styles.votePanel}>
        <VoteButton
          type="up"
          size="lg"
          active={detail.currentUserVote === 'Up'}
          onClick={() => onVote(detail.currentUserVote === 'Up' ? null : 'Up')}
          disabled={loading}
        />
        <span className={styles.bigScore}>{detail.score}</span>
        <VoteButton
          type="down"
          size="lg"
          active={detail.currentUserVote === 'Down'}
          onClick={() =>
            onVote(detail.currentUserVote === 'Down' ? null : 'Down')
          }
          disabled={loading}
        />
      </div>

      <Button
        variant="outline"
        fullWidth
        onClick={() => onVote(null)}
        disabled={!detail.currentUserVote || loading}
      >
        {detail.currentUserVote ? 'Отменить голос' : 'Проголосовать'}
      </Button>

      {detail.votes.length > 0 && (
        <div className={styles.voters}>
          <h4>Up ({detail.votes.filter((v) => v.voteType === 'Up').length})</h4>
          <div className={styles.tags}>
            {detail.votes
              .filter((v) => v.voteType === 'Up')
              .map((v) => (
                <span key={v.userId}>{v.displayName}</span>
              ))}
          </div>
          <h4>
            Down ({detail.votes.filter((v) => v.voteType === 'Down').length})
          </h4>
          <div className={styles.tags}>
            {detail.votes
              .filter((v) => v.voteType === 'Down')
              .map((v) => (
                <span key={v.userId}>{v.displayName}</span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
