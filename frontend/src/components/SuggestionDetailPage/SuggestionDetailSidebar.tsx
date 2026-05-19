import { Button } from '../ui/Button/Button';
import { VotePanel } from './VotePanel';
import type {
  CurrentUserVoteQuota,
  SuggestionDetails,
  VoteType,
} from '../../types/api';
import styles from '../../assets/SuggestionDetailPage.module.css';

interface SuggestionDetailSidebarProps {
  detail: SuggestionDetails;
  loading: boolean;
  voteQuota: CurrentUserVoteQuota | null;
  voteError: string | null;
  onVote: (type: VoteType | null) => Promise<void>;
  onCopyLink: () => void;
}

export function SuggestionDetailSidebar({
  detail,
  loading,
  voteQuota,
  voteError,
  onVote,
  onCopyLink,
}: SuggestionDetailSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <VotePanel
        detail={detail}
        loading={loading}
        voteQuota={voteQuota}
        error={voteError}
        onVote={onVote}
      />
      <div className={styles.card}>
        <h4>Действия</h4>
        <Button variant="outline" fullWidth onClick={onCopyLink}>
          Копировать ссылку
        </Button>
      </div>
    </div>
  );
}
