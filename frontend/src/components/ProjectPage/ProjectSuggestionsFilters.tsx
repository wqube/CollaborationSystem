import { STATUS_LABELS } from '../../shared/utils/statusLabels';
import type { StatusFilter } from '../../hooks/useProjectSuggestions';
import type { OrderSort, SuggestionSort } from '../../types/api';
import styles from '../../assets/ProjectPage.module.css';

interface ProjectSuggestionsFiltersProps {
  statusFilter: StatusFilter;
  search: string;
  sort: SuggestionSort;
  order: OrderSort;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onSortChange: (value: SuggestionSort) => void;
  onOrderChange: (value: OrderSort) => void;
}

export function ProjectSuggestionsFilters({
  statusFilter,
  search,
  sort,
  order,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onOrderChange,
}: ProjectSuggestionsFiltersProps) {
  return (
    <div className={styles.filters}>
      <div className={styles.filterGroup}>
        <label>Поиск</label>
        <input
          type="text"
          placeholder="Поиск по тексту..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className={styles.filterGroup}>
        <label>Статус</label>
        <select
          value={statusFilter === 'drafts' ? '' : statusFilter}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
        >
          <option value="">Все статусы</option>
          <option value="New">{STATUS_LABELS.New}</option>
          <option value="InProgress">{STATUS_LABELS.InProgress}</option>
          <option value="Accepted">{STATUS_LABELS.Accepted}</option>
          <option value="Rejected">{STATUS_LABELS.Rejected}</option>
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label>Сортировка</label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SuggestionSort)}
        >
          <option value="score">По рейтингу</option>
          <option value="createdAt">По дате создания</option>
          <option value="updatedAt">По обновлению</option>
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label>Порядок</label>
        <select
          value={order}
          onChange={(e) => onOrderChange(e.target.value as OrderSort)}
        >
          <option value="desc">По убыванию</option>
          <option value="asc">По возрастанию</option>
        </select>
      </div>
    </div>
  );
}
