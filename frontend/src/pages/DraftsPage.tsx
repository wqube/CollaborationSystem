import { useState } from 'react';
import { Button } from '../components/ui/Button/Button';
import styles from '../assets/DraftsPage.module.css';

const MOCK_DRAFTS = [
  {
    id: '1',
    type: 'Комментарий' as const,
    text: 'Согласен, но нужно еще шаблон action items.',
    suggestion: 'Добавить шаблон ретро...',
    replyTo: 'Иван Петров',
    date: '2026-04-09 19:00',
  },
  {
    id: '2',
    type: 'Предложение' as const,
    text: 'Автоматизировать процесс code review через бота...',
    project: 'Core Platform',
    date: '2026-04-08 15:30',
  },
  {
    id: '3',
    type: 'Предложение' as const,
    text: 'Внедрить ежедневные стендапы в 10:00...',
    project: 'Mobile App',
    date: '2026-04-07 11:20',
  },
];

export function DraftsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'suggestion' | 'comment'>(
    'all',
  );

  const filtered = MOCK_DRAFTS.filter((d) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'suggestion') return d.type === 'Предложение';
    return d.type === 'Комментарий';
  });

  return (
    <div className={styles.page}>
      <h1>Черновики</h1>

      <div className={styles.tabs}>
        {(['all', 'suggestion', 'comment'] as const).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all'
              ? 'Все'
              : tab === 'suggestion'
                ? 'Предложения'
                : 'Комментарии'}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.map((draft) => (
          <div key={draft.id} className={styles.draftCard}>
            <div className={styles.draftHeader}>
              <span
                className={`${styles.type} ${draft.type === 'Комментарий' ? styles.typeComment : styles.typeSuggestion}`}
              >
                {draft.type}
              </span>
              <span className={styles.date}>{draft.date}</span>
            </div>
            <p className={styles.text}>{draft.text}</p>
            <div className={styles.meta}>
              {draft.suggestion && (
                <span>К предложению: {draft.suggestion}</span>
              )}
              {draft.replyTo && <span>В ответ на: {draft.replyTo}</span>}
              {draft.project && <span>Проект: {draft.project}</span>}
            </div>
            <div className={styles.actions}>
              <Button variant="primary" size="sm">
                Продолжить
              </Button>
              <Button variant="danger" size="sm">
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
