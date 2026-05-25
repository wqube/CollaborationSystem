import type { OrderSort, SuggestionSort } from '../../types/api';
import styles from '../../assets/ProjectPage.module.css';

interface ProjectSuggestionsFiltersProps {
  search: string;
  sort: SuggestionSort;
  order: OrderSort;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SuggestionSort) => void;
  onOrderChange: (value: OrderSort) => void;
}

export function ProjectSuggestionsFilters({
  search,
  sort,
  order,
  onSearchChange,
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
