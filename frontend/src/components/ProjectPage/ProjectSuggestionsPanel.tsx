import { ProjectPagination } from './ProjectPagination';
import { ProjectSuggestionsFilters } from './ProjectSuggestionsFilters';
import { ProjectSuggestionsTable } from './ProjectSuggestionsTable';
import { ProjectVoteQuotaBar } from './ProjectVoteQuotaBar';
import type { ProjectSuggestionsState } from '../../hooks/useProjectSuggestions';
import type { CurrentUserVoteQuota, ProjectRole } from '../../types/api';
import styles from '../../assets/ProjectPage.module.css';

interface ProjectSuggestionsPanelProps {
  projectId: string;
  projectRole?: ProjectRole;
  projectLoading: boolean;
  voteQuota: CurrentUserVoteQuota | null;
  suggestionsState: ProjectSuggestionsState;
  onVoteQuotaChange: (voteQuota: CurrentUserVoteQuota) => void;
  onOpenSuggestion: (suggestionId: string, projectRole?: ProjectRole) => void;
}

export function ProjectSuggestionsPanel({
  projectId,
  projectRole,
  projectLoading,
  voteQuota,
  suggestionsState,
  onVoteQuotaChange,
  onOpenSuggestion,
}: ProjectSuggestionsPanelProps) {
  const {
    statusFilter,
    search,
    sort,
    order,
    page,
    total,
    totalPages,
    pageSize,
    suggestions,
    loading,
    error,
    handleSearchChange,
    handleStatusChange,
    handleSortChange,
    handleOrderChange,
    setPage,
    handleVoteSuccess,
  } = suggestionsState;

  return (
    <>
      {error && <p className={styles.error}>{error}</p>}

      {!error && (
        <>
          <ProjectVoteQuotaBar voteQuota={voteQuota} />
          <ProjectSuggestionsFilters
            statusFilter={statusFilter}
            search={search}
            sort={sort}
            order={order}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onSortChange={handleSortChange}
            onOrderChange={handleOrderChange}
          />
          <ProjectSuggestionsTable
            projectId={projectId}
            projectRole={projectRole}
            suggestions={suggestions}
            projectLoading={projectLoading}
            suggestionsLoading={loading}
            voteQuota={voteQuota}
            onVoteQuotaChange={onVoteQuotaChange}
            onVoteSuccess={handleVoteSuccess}
            onOpenSuggestion={onOpenSuggestion}
          />
          <ProjectPagination
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </>
  );
}
