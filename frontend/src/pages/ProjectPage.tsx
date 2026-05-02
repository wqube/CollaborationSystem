import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { Badge } from '../components/ui/Badge/Badge';
import { Tabs, type TabItem } from '../components/ui/Tabs/Tabs';
import { VoteButton } from '../components/ui/VoteButton/VoteButton';
import { CreateSuggestionModal } from '../components/CreateSuggestionModal/CreateSuggestionModal';
import { SettingsModal } from '../components/SettingsModal/SettingsModal';
import { MembersModal } from '../components/MembersModal/MembersModal';
import styles from '../assets/ProjectPage.module.css';
import { getDashboard } from '../shared/api/dashboard';
import type {
  ProjectSummary,
  SuggestionStatus,
  SuggestionSummary,
} from '../types/api';

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
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId') ?? undefined;

  const [activeTab, setActiveTab] = useState<SuggestionStatus>('New');
  const [suggestions, setSuggestions] = useState<SuggestionSummary[]>([]);
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [suggestionModalOpen, setSuggestionModalOpen] = useState(!!draftId);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  const fetchDashboard = async (status: SuggestionStatus) => {
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
  };

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
          <Button
            variant="primary"
            onClick={() => setSuggestionModalOpen(true)}
          >
            Предложить идею
          </Button>
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
                  <th>Score</th>
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
                      <br />
                      <span className={styles.idText}>
                        id: {s.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td>{s.author.displayName}</td>
                    <td>
                      <div
                        className={styles.voteGroup}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <VoteButton type="up" active={false} size="sm" />
                        <span className={styles.score}>{s.score}</span>
                        <VoteButton type="down" active={false} size="sm" />
                      </div>
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

      <CreateSuggestionModal
        open={suggestionModalOpen}
        onClose={() => setSuggestionModalOpen(false)}
        onSuccess={() => {
          setSuggestionModalOpen(false);
          fetchDashboard(activeTab);
        }}
        projectId={projectId!}
        draftId={draftId}
      />
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
