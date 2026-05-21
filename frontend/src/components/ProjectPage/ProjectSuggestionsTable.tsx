import { Badge } from '../ui/Badge/Badge';
import { SuggestionVoteCell } from '../SuggestionVoteCell/SuggestionVoteCell';
import type {
  CurrentUserVoteQuota,
  ProjectRole,
  SuggestionSummary,
} from '../../types/api';
import styles from '../../assets/ProjectPage.module.css';

interface ProjectSuggestionsTableProps {
  projectId: string;
  projectRole?: ProjectRole;
  suggestions: SuggestionSummary[];
  projectLoading: boolean;
  suggestionsLoading: boolean;
  voteQuota: CurrentUserVoteQuota | null;
  onVoteQuotaChange: (voteQuota: CurrentUserVoteQuota) => void;
  onVoteSuccess: (
    suggestionId: string,
    newScore: number,
    currentUserVote: SuggestionSummary['currentUserVote'],
    voteQuota: CurrentUserVoteQuota,
  ) => void;
  onOpenSuggestion: (suggestionId: string, projectRole?: ProjectRole) => void;
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getStatusBadgeVariant = (status: SuggestionSummary['status']) => {
  if (status === 'New') return 'new';
  if (status === 'InProgress') return 'progress';
  if (status === 'Accepted') return 'accepted';
  return 'rejected';
};

export function ProjectSuggestionsTable({
  projectId,
  projectRole,
  suggestions,
  projectLoading,
  suggestionsLoading,
  voteQuota,
  onVoteQuotaChange,
  onVoteSuccess,
  onOpenSuggestion,
}: ProjectSuggestionsTableProps) {
  const loading = projectLoading || suggestionsLoading;
  const isEmpty = suggestions.length === 0 && !loading;

  return (
    <div className={styles.tableWrapper}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <p className={styles.state}>Загрузка...</p>
        </div>
      )}
      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>Предложение</th>
              <th>Автор</th>
              <th>Голоса</th>
              <th>Дата</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  Предложений нет
                </td>
              </tr>
            ) : (
              suggestions.map((suggestion) => (
                <tr
                  key={suggestion.id}
                  onClick={() => onOpenSuggestion(suggestion.id, projectRole)}
                  className={styles.row}
                >
                  <td data-label="Предложение">
                    <strong className={styles.suggestionText}>
                      {suggestion.text}
                    </strong>
                    <br />
                    <span className={styles.idText}>
                      id: {suggestion.id.slice(0, 8)}...
                    </span>
                  </td>
                  <td data-label="Автор">{suggestion.author.displayName}</td>
                  <td data-label="Голоса" onClick={(e) => e.stopPropagation()}>
                    <SuggestionVoteCell
                      projectId={projectId}
                      suggestion={suggestion}
                      voteQuota={voteQuota}
                      onVoteQuotaChange={onVoteQuotaChange}
                      onVoteSuccess={onVoteSuccess}
                    />
                  </td>
                  <td data-label="Дата">
                    {formatDateTime(suggestion.createdAt)}
                  </td>
                  <td data-label="Статус">
                    <Badge variant={getStatusBadgeVariant(suggestion.status)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
