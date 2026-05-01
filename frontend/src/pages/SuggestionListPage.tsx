import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { Badge } from '../components/ui/Badge/Badge';
import { VoteButton } from '../components/ui/VoteButton/VoteButton';
import { getSuggestions } from '../shared/api/suggestions';
import type {
  SuggestionSummary,
  SuggestionStatus,
  SuggestionSort,
  OrderSort,
} from '../types/api';
import styles from '../assets/SuggestionListPage.module.css';
import { useCallback, useEffect, useState } from 'react';

const PAGE_SIZE = 10;

export function SuggestionListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState<SuggestionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SuggestionStatus | ''>('');
  const [sort, setSort] = useState<SuggestionSort>('score');
  const [order, setOrder] = useState<OrderSort>('desc');

  const fetchSuggestions = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      const responce = await getSuggestions(projectId, {
        status: status || undefined,
        search: search || undefined,
        sort: sort || undefined,
        order: order || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setSuggestions(responce.item);
      setTotal(responce.total);
    } catch {
      setError('Ошибка загрузки предложений');
    } finally {
      setLoading(false);
    }
  }, [projectId, search, status, sort, order, page]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  const getBadgeVariant = (status: SuggestionStatus) => {
    switch (status) {
      case 'New':
        return 'new';
      case 'InProgress':
        return 'progress';
      case 'Accepted':
        return 'accepted';
      case 'Rejected':
        return 'rejected';
      default:
        return 'new';
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Все предложения</h1>
        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Назад к доске
          </Button>
          <Button variant="primary" onClick={() => alert('Open modal')}>
            Предложить идею
          </Button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Поиск</label>
          <input
            type="text"
            placeholder="Поиск по тексту..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Статус</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as SuggestionStatus | '');
              setPage(1);
            }}
          >
            <option value="">Все статусы</option>
            <option>New</option>
            <option>InProgress</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Сортировка</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SuggestionSort)}
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
            onChange={(e) => setOrder(e.target.value as OrderSort)}
          >
            <option value="desc">По убыванию</option>
            <option value="asc">По возрастанию</option>
          </select>
        </div>
      </div>

      {!loading && !error && (
        <>
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
                {suggestions.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.empty}>
                      Предложений нет
                    </td>
                  </tr>
                )}
                {suggestions.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() =>
                      navigate(`/projects/${projectId}/suggestions/${s.id}`)
                    }
                    className={styles.row}
                  >
                    <td>
                      <strong>{s.text}</strong>
                    </td>
                    <td>{s.author?.displayName ?? '—'}</td>
                    <td>
                      <div
                        className={styles.voteGroup}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <VoteButton type="up" size="sm" />
                      </div>
                    </td>
                    <td>{formatDate(s.createdAt)}</td>
                    <td>
                      <Badge variant={getBadgeVariant(s.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={p === page ? styles.active : ''}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                →
              </button>
              <span>
                {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)}{' '}
                из {total}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
