import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { Badge } from '../components/ui/Badge/Badge';
import { VoteButton } from '../components/ui/VoteButton/VoteButton';
import styles from '../assets/SuggestionListPage.module.css';

const MOCK = Array.from({ length: 7 }, (_, i) => ({
  id: `id-${i}`,
  text: [
    'Добавить обязательный шаблон ретро',
    'Автоматизировать деплой',
    'Внедрить парное программирование',
    'Обновить документацию',
    'Настроить форматирование',
    'Pre-commit хуки',
    'Новая версия UI',
  ][i],
  author: [
    'Иван Петров',
    'Мария Сидорова',
    'Алексей Иванов',
    'Ольга Смирнова',
    'Сергей Козлов',
    'Елена Смирнова',
    'Алексей Иванов',
  ][i],
  score: [5, 8, 3, 2, 6, 4, -1][i],
  status: ['New', 'New', 'InProgress', 'New', 'New', 'Accepted', 'Rejected'][
    i
  ] as any,
  date: '2026-04-0' + (9 - i),
  voted: [true, false, false, false, false, false, true][i],
}));

export function SuggestionListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Все предложения</h1>
        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            [&lt;-] Назад к доске
          </Button>
          <Button variant="primary" onClick={() => alert('Open modal')}>
            [+] Предложить идею
          </Button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Поиск</label>
          <input type="text" placeholder="Поиск по тексту..." />
        </div>
        <div className={styles.filterGroup}>
          <label>Статус</label>
          <select>
            <option value="">Все статусы</option>
            <option>New</option>
            <option>InProgress</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Сортировка</label>
          <select>
            <option>По рейтингу</option>
            <option>По дате создания</option>
            <option>По обновлению</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Порядок</label>
          <select>
            <option>По убыванию</option>
            <option>По возрастанию</option>
          </select>
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
            {MOCK.map((s) => (
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
                <td>{s.author}</td>
                <td>
                  <div
                    className={styles.voteGroup}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <VoteButton
                      type="up"
                      active={s.voted && s.score > 0}
                      size="sm"
                    />
                    <span className={styles.score}>{s.score}</span>
                    <VoteButton
                      type="down"
                      active={s.voted && s.score < 0}
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

      <div className={styles.pagination}>
        <button disabled>←</button>
        <button className={styles.active}>1</button>
        <button>2</button>
        <button>3</button>
        <button>→</button>
        <span>1-7 из 23</span>
      </div>
    </div>
  );
}
