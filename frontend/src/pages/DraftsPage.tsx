import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import apiClient from '../shared/api/client';
import styles from '../assets/DraftsPage.module.css';

type DraftType = 'Suggestion' | 'Comment';

interface SuggestionPayload {
  text: string;
}

interface CommentPayload {
  suggestionId: string;
  parentCommentId: string | null;
  text: string;
}

interface DraftDto {
  id: string;
  projectId: string;
  type: DraftType;
  payload: SuggestionPayload | CommentPayload;
  updatedAt: string;
}

type ActiveTab = 'all' | 'Suggestion' | 'Comment';

function isCommentPayload(
  payload: SuggestionPayload | CommentPayload,
  type: DraftType,
): payload is CommentPayload {
  return type === 'Comment';
}

export function DraftsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [drafts, setDrafts] = useState<DraftDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    const typeParam = activeTab !== 'all' ? `?type=${activeTab}` : '';

    apiClient
      .get<{
        items: DraftDto[];
        page: number;
        pageSize: number;
        total: number;
      }>(`/projects/${projectId}/drafts${typeParam}`)
      .then((res) => setDrafts(res.data.items))
      .catch(() => setError('Не удалось загрузить черновики'))
      .finally(() => setLoading(false));
  }, [projectId, activeTab]);

  const handleDelete = async (draftId: string) => {
    try {
      await apiClient.delete(`/projects/${projectId}/drafts/${draftId}`);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    } catch {
      setError('Не удалось удалить черновик');
    }
  };

  const handleContinue = (draft: DraftDto) => {
    if (draft.type === 'Suggestion') {
      navigate(`/projects/${projectId}?draftId=${draft.id}`);
    } else {
      const payload = draft.payload as CommentPayload;
      navigate(
        `/projects/${projectId}/suggestions/${payload.suggestionId}?draftId=${draft.id}`,
      );
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Button
          variant="outline"
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          ← Назад к доске
        </Button>
      </div>
      <h1>Черновики</h1>

      <div className={styles.tabs}>
        {(['all', 'Suggestion', 'Comment'] as const).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all'
              ? 'Все'
              : tab === 'Suggestion'
                ? 'Предложения'
                : 'Комментарии'}
          </button>
        ))}
      </div>

      {loading && <p className={styles.state}>Загрузка...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && drafts.length === 0 && (
        <p className={styles.state}>Черновиков нет</p>
      )}

      <div className={styles.list}>
        {drafts.map((draft) => {
          const isComment = isCommentPayload(draft.payload, draft.type);
          const text = draft.payload.text;

          return (
            <div key={draft.id} className={styles.draftCard}>
              <div className={styles.draftHeader}>
                <span
                  className={`${styles.type} ${
                    isComment ? styles.typeComment : styles.typeSuggestion
                  }`}
                >
                  {isComment ? 'Комментарий' : 'Предложение'}
                </span>
                <span className={styles.date}>
                  {formatDate(draft.updatedAt)}
                </span>
              </div>

              <p className={styles.text}>{text}</p>

              <div className={styles.meta}>
                {isComment && (
                  <span>
                    К предложению:{' '}
                    {(draft.payload as CommentPayload).suggestionId}
                  </span>
                )}
              </div>

              <div className={styles.actions}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleContinue(draft)}
                >
                  Продолжить
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(draft.id)}
                >
                  Удалить
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
