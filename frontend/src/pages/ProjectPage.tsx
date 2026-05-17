import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { Badge } from '../components/ui/Badge/Badge';
import { Tabs, type TabItem } from '../components/ui/Tabs/Tabs';
import { SettingsModal } from '../components/SettingsModal/SettingsModal';
import { MembersModal } from '../components/MembersModal/MembersModal';
import styles from '../assets/ProjectPage.module.css';
import { getDashboard } from '../shared/api/dashboard';
import { useAppDispatcher, userAppSelector } from '../shared/store/hooks';
import { fetchProjects } from '../shared/store/projectsSlice';
import type {
  ProjectSummary,
  SuggestionStatus,
  SuggestionSummary,
} from '../types/api';
import { CreateSuggestionButton } from '../components/CreateSuggestionButton/CreateSuggestionButton';
import { SuggestionVoteCell } from '../components/SuggestionVoteCell/SuggestionVoteCell';
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs';

export interface suggestionsPreviewInterface {
  suggestionsPreview: SuggestionSummary[];
}

const TABS: TabItem[] = [
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

  const [activeTab, setActiveTab] = useState<SuggestionStatus>('New');
  const [suggestions, setSuggestions] = useState<SuggestionSummary[]>([]);
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  const fetchDashboard = useCallback(
    async (status: SuggestionStatus) => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getDashboard(projectId, { status, pageSize: 5 });

        setProject(data.project);
        setSuggestions(data.suggestions.items);
      } catch {
        setError('Не удалось загрузить данные проекта');
      } finally {
        setLoading(false);
      }
    },
    [projectId],
  );

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  useEffect(() => {
    fetchDashboard(activeTab);
  }, [projectId, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as SuggestionStatus);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  return (
    <div className={styles.page}>
      <Breadcrumbs />
      {project && <h1 className={styles.projectTitle}>{project.name}</h1>}
      <div className={styles.header}>
        <Tabs tabs={TABS} activeTab={activeTab} onChange={handleTabChange} />
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

          <Button variant="outline" onClick={() => setSettingsModalOpen(true)}>
            Настройки
          </Button>

          <CreateSuggestionButton
            projectId={projectId!}
            onRefresh={() => fetchDashboard(activeTab)}
            variant="primary"
            buttonText="Предложить идею"
          />
        </div>
      </div>

      {loading && <p className={styles.state}>Загрузка...</p>}
      {error && <p className={styles.error}>{error}</p>}

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

          <div className={styles.viewAll}>
            <Button
              variant="outline"
              onClick={() => navigate(`/projects/${projectId}/suggestions`)}
            >
              Все предложения →
            </Button>
          </div>
        </>
      )}

      <SettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        projectId={projectId!}
        projectName={project?.name ?? ''}
        projectDescription={project?.description ?? ''}
      />
      <MembersModal
        open={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        projectId={projectId!}
      />
    </div>
  );
}
