import { Button } from '../ui/Button/Button';
import { VoteButton } from '../ui/VoteButton/VoteButton';
import type {
  CurrentUserVoteQuota,
  SuggestionDetails,
  VoteType,
} from '../../types/api';
import styles from '../../assets/SuggestionDetailPage.module.css';

interface VotePanelProps {
  detail: SuggestionDetails;
  loading: boolean;
  voteQuota: CurrentUserVoteQuota | null;
  error?: string | null;
  onVote: (type: VoteType | null) => Promise<void>;
}

export function VotePanel({
  detail,
  loading,
  voteQuota,
  error,
  onVote,
}: VotePanelProps) {
  const limitReached =
    detail.currentUserVote === null &&
    voteQuota !== null &&
    voteQuota.votesRemaining <= 0;
  const voteDisabled = loading || limitReached;
  const resetLabel = voteQuota
    ? new Date(voteQuota.nextResetAt).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className={styles.card}>
      <h3>Голосование</h3>

      {voteQuota && (
        <div className={styles.voteQuota}>
          <span>
            Доступно голосов: {voteQuota.votesRemaining} из{' '}
            {voteQuota.votesLimit}
          </span>
          <span>Сброс: {resetLabel}</span>
        </div>
      )}

      <div className={styles.votePanel}>
        <VoteButton
          type="up"
          size="lg"
          active={detail.currentUserVote === 'Up'}
          onClick={() => onVote(detail.currentUserVote === 'Up' ? null : 'Up')}
          disabled={voteDisabled}
        />
        <span className={styles.bigScore}>{detail.score}</span>
        <VoteButton
          type="down"
          size="lg"
          active={detail.currentUserVote === 'Down'}
          onClick={() =>
            onVote(detail.currentUserVote === 'Down' ? null : 'Down')
          }
          disabled={voteDisabled}
        />
      </div>

      {error && <p className={styles.inlineError}>{error}</p>}

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
          <h4>За ({detail.votes.filter((v) => v.voteType === 'Up').length})</h4>
          <div className={styles.tags}>
            {detail.votes
              .filter((v) => v.voteType === 'Up')
              .map((v) => (
                <span key={v.userId}>{v.displayName}</span>
              ))}
          </div>
          <h4>
            Против ({detail.votes.filter((v) => v.voteType === 'Down').length})
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
