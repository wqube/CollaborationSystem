import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { Badge } from '../components/ui/Badge/Badge';
import { Tabs, type TabItem } from '../components/ui/Tabs/Tabs';
import { SettingsModal } from '../components/SettingsModal/SettingsModal';
import { MembersModal } from '../components/MembersModal/MembersModal';
import styles from '../assets/ProjectPage.module.css';
import { getDashboard } from '../shared/api/dashboard';
import { getSuggestions } from '../shared/api/suggestions';
import { useAppDispatcher, userAppSelector } from '../shared/store/hooks';
import { fetchProjects } from '../shared/store/projectsSlice';
import {
  canManageProjectMembers,
  canManageProjectRoles,
  canManageProjectSettings,
} from '../shared/utils/projectRole';
import type {
  OrderSort,
  ProjectSummary,
  SuggestionSort,
  SuggestionStatus,
  SuggestionSummary,
} from '../types/api';
import { CreateSuggestionButton } from '../components/CreateSuggestionButton/CreateSuggestionButton';
import { SuggestionVoteCell } from '../components/SuggestionVoteCell/SuggestionVoteCell';
import { Breadcrumbs } from '../components/Breadcrumbs/BreadCrumbs';

const PAGE_SIZE = 5;

type StatusFilter = SuggestionStatus | '';

const TABS: TabItem[] = [
  { id: '', label: 'Все' },
  { id: 'New', label: 'New' },
  { id: 'InProgress', label: 'InProgress' },
  { id: 'Accepted', label: 'Accepted' },
  { id: 'Rejected', label: 'Rejected' },
];

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const dispatch = useAppDispatcher();
  const { list: projects } = userAppSelector((state) => state.projects);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('New');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SuggestionSort>('score');
  const [order, setOrder] = useState<OrderSort>('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [suggestions, setSuggestions] = useState<SuggestionSummary[]>([]);
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;

    setProjectLoading(true);
    setError(null);

    try {
      const data = await getDashboard(projectId, { pageSize: 1 });
      setProject(data.project);
    } catch {
      setError('Не удалось загрузить данные проекта');
    } finally {
      setProjectLoading(false);
    }
  }, [projectId]);

  const fetchSuggestions = useCallback(async () => {
    if (!projectId) return;

    setSuggestionsLoading(true);
    setError(null);

    try {
      const data = await getSuggestions(projectId, {
        status: statusFilter || undefined,
        search: search || undefined,
        sort,
        order,
        page,
        pageSize: PAGE_SIZE,
      });

      setSuggestions(data.items);
      setTotal(data.total);
    } catch {
      setError('Не удалось загрузить предложения');
    } finally {
      setSuggestionsLoading(false);
    }
  }, [projectId, statusFilter, search, sort, order, page]);

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleTabChange = (tab: string) => {
    setStatusFilter(tab as StatusFilter);
    setPage(1);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  const canManageSettings = canManageProjectSettings(project?.role);
  const canManageMembers = canManageProjectMembers(project?.role);
  const canManageRoles = canManageProjectRoles(project?.role);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className={styles.page}>
      <Breadcrumbs />
      {project && <h1 className={styles.projectTitle}>{project.name}</h1>}
      <div className={styles.header}>
        <Tabs tabs={TABS} activeTab={statusFilter} onChange={handleTabChange} />
        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}/drafts`)}
          >
            Черновики
          </Button>

          <Button variant="outline" onClick={() => setMembersModalOpen(true)}>
            Участники
          </Button>

          {canManageSettings && (
            <Button
              variant="outline"
              onClick={() => setSettingsModalOpen(true)}
            >
              Настройки
            </Button>
          )}

          <CreateSuggestionButton
            projectId={projectId!}
            onRefresh={fetchSuggestions}
            variant="primary"
            buttonText="Предложить идею"
          />
        </div>
      </div>

      {(projectLoading || suggestionsLoading) && (
        <p className={styles.state}>Загрузка...</p>
      )}
      {error && <p className={styles.error}>{error}</p>}

      {!projectLoading && !error && (
        <>
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
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setPage(1);
                }}
              >
                <option value="">Все статусы</option>
                <option value="New">New</option>
                <option value="InProgress">InProgress</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Сортировка</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SuggestionSort);
                  setPage(1);
                }}
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
                onChange={(e) => {
                  setOrder(e.target.value as OrderSort);
                  setPage(1);
                }}
              >
                <option value="desc">По убыванию</option>
                <option value="asc">По возрастанию</option>
              </select>
            </div>
          </div>

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
                      navigate(`/projects/${projectId}/suggestions/${s.id}`, {
                        state: { userRole: project?.role },
                      })
                    }
                    className={styles.row}
                  >
                    <td>
                      <strong>{s.text}</strong>
                      <br />
                      <span className={styles.idText}>
                        id: {s.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td>{s.author.displayName}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <SuggestionVoteCell
                        projectId={projectId!}
                        suggestion={s}
                        onVoteSuccess={(id, newScore) => {
                          setSuggestions((prev) =>
                            prev.map((item) =>
                              item.id === id
                                ? { ...item, score: newScore }
                                : item,
                            ),
                          );
                        }}
                      />
                    </td>
                    <td>{formatDate(s.createdAt)}</td>
                    <td>
                      <Badge
                        variant={
                          s.status === 'New'
                            ? 'new'
                            : s.status === 'InProgress'
                              ? 'progress'
                              : s.status === 'Accepted'
                                ? 'accepted'
                                : 'rejected'
                        }
                      />
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

      {canManageSettings && (
        <SettingsModal
          open={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          projectId={projectId!}
          projectName={project?.name ?? ''}
          projectDescription={project?.description ?? ''}
        />
      )}
      <MembersModal
        open={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        projectId={projectId!}
        canManageMembers={canManageMembers}
        canManageRoles={canManageRoles}
      />
    </div>
  );
}
