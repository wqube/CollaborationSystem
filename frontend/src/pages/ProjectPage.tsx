import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { Badge } from '../components/ui/Badge/Badge';
import { Tabs, type TabItem } from '../components/ui/Tabs/Tabs';
import { VoteButton } from '../components/ui/VoteButton/VoteButton';
import { CreateSuggestionModal } from '../components/CreateSuggestionModal/CreateSuggestionModal';
import { SettingsModal } from '../components/SettingsModal/SettingsModal';
import { MembersModal } from '../components/MembersModal/MembersModal';
import styles from '../assets/ProjectPage.module.css';

const TABS: TabItem[] = [
  { id: 'New', label: 'New', count: 4 },
  { id: 'InProgress', label: 'InProgress', count: 2 },
  { id: 'Accepted', label: 'Accepted', count: 8 },
  { id: 'Rejected', label: 'Rejected', count: 3 },
];

type SuggestionStatus = 'New' | 'InProgress' | 'Accepted' | 'Rejected';
type VoteStatus = 'up' | 'down' | null;

interface Suggestion {
  id: string;
  text: string;
  author: string;
  score: number;
  status: SuggestionStatus;
  date: string;
  voted: VoteStatus;
}

const MOCK_SUGGESTIONS: Suggestion[] = [
  {
    id: 'd68650b5',
    text: 'Добавить обязательный шаблон ретро перед встречей',
    author: 'Иван Петров',
    score: 5,
    status: 'New',
    date: '2026-04-09',
    voted: 'up',
  },
  {
    id: 'e79761c6',
    text: 'Автоматизировать деплой на тестовые стенды',
    author: 'Мария Сидорова',
    score: 8,
    status: 'New',
    date: '2026-04-08',
    voted: 'down',
  },
  {
    id: 'f80872d7',
    text: 'Внедрить практику парного программирования',
    author: 'Алексей Иванов',
    score: 3,
    status: 'InProgress',
    date: '2026-04-07',
    voted: null,
  },
  {
    id: '091983e8',
    text: 'Обновить документацию по API',
    author: 'Ольга Смирнова',
    score: 2,
    status: 'New',
    date: '2026-04-06',
    voted: null,
  },
  {
    id: '1a2b3c4d',
    text: 'Настроить автоматическое форматирование кода',
    author: 'Сергей Козлов',
    score: 6,
    status: 'New',
    date: '2026-04-05',
    voted: null,
  },
];

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('New');
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <div className={styles.actions}>
          <Button variant="outline" onClick={() => setMembersModalOpen(true)}>
            [@] Участники
          </Button>
          <Button variant="outline" onClick={() => setSettingsModalOpen(true)}>
            [*] Настройки
          </Button>
          <Button
            variant="primary"
            onClick={() => setSuggestionModalOpen(true)}
          >
            [+] Предложить идею
          </Button>
        </div>
      </div>

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
            {MOCK_SUGGESTIONS.map((s) => (
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
                  <span className={styles.idText}>id: {s.id}...</span>
                </td>
                <td>{s.author}</td>
                <td>
                  <div
                    className={styles.voteGroup}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <VoteButton type="up" active={s.voted === 'up'} size="sm" />
                    <span className={styles.score}>{s.score}</span>
                    <VoteButton
                      type="down"
                      active={s.voted === 'down'}
                      size="sm"
                    />
                  </div>
                </td>
                <td>{s.date}</td>
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

      <CreateSuggestionModal
        open={suggestionModalOpen}
        onClose={() => setSuggestionModalOpen(false)}
        onSuccess={() => setSuggestionModalOpen(false)}
        projectId={projectId!}
      />
      <SettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        projectId={projectId!}
        projectName="Core Platform"
        projectDescription="Проект команды Core Platform"
      />
      <MembersModal
        open={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        projectId={projectId!}
      />
    </div>
  );
}
