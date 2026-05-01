import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { Badge } from '../components/ui/Badge/Badge';
import { VoteButton } from '../components/ui/VoteButton/VoteButton';
import styles from '../assets/SuggestionDetailPage.module.css';

export function SuggestionDetailPage() {
  const { projectId, suggestionId } = useParams<{
    projectId: string;
    suggestionId: string;
  }>();
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Button variant="outline" onClick={() => navigate(-1)}>
        [&lt;-] Назад к списку
      </Button>

      <div className={styles.twoColumns}>
        <div className={styles.main}>
          <div className={styles.card}>
            <div className={styles.top}>
              <div>
                <h1>Добавить обязательный шаблон ретро перед встречей</h1>
                <div className={styles.meta}>
                  <Badge variant="new" />
                  <span>Автор: Иван Петров</span>
                  <span>Создано: 2026-04-09</span>
                </div>
              </div>
              <select className={styles.statusSelect}>
                <option>New</option>
                <option>InProgress</option>
                <option>Accepted</option>
                <option>Rejected</option>
              </select>
            </div>
            <p className={styles.description}>
              Добавить обязательный шаблон ретро перед встречей. Это сократит
              время встречи и повысит предсказуемость.
            </p>
            <div className={styles.meta}>
              id: {suggestionId} | updated: 2026-04-09
            </div>
          </div>

          <div className={styles.card}>
            <h3>Обсуждение</h3>
            <textarea
              placeholder="Оставьте комментарий..."
              rows={3}
              className={styles.commentInput}
            />
            <div className={styles.commentActions}>
              <span className={styles.draft}>Draft saved at 19:00</span>
              <Button variant="primary">Отправить</Button>
            </div>

            <div className={styles.comments}>
              <div className={styles.comment}>
                <div className={styles.commentHeader}>
                  <div className={styles.avatar}>ИП</div>
                  <div>
                    <strong>Иван Петров</strong>
                    <span className={styles.time}>2026-04-09</span>
                  </div>
                </div>
                <p>Поддерживаю, это сократит время встречи.</p>
                <div className={styles.commentBtns}>
                  <button>Ответить</button>
                  <button>Ред.</button>
                  <button>Удалить</button>
                </div>
              </div>

              <div className={styles.nested}>
                <div className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <div className={styles.avatar}>АС</div>
                    <div>
                      <strong>Анна Соколова</strong>
                      <span className={styles.time}>2026-04-09</span>
                    </div>
                  </div>
                  <p>Согласен, нужен еще шаблон action items.</p>
                  <div className={styles.commentBtns}>
                    <button>Ответить</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h3>Голосование</h3>
            <div className={styles.votePanel}>
              <VoteButton type="up" active size="lg" />
              <span className={styles.bigScore}>5</span>
              <VoteButton type="down" size="lg" />
            </div>
            <Button variant="outline" fullWidth>
              Отменить голос (current: Up)
            </Button>
            <div className={styles.voters}>
              <h4>Up (4)</h4>
              <div className={styles.tags}>
                <span>Иван Петров</span>
                <span>Мария Сидорова</span>
                <span>Алексей Иванов</span>
                <span>Ольга Смирнова</span>
              </div>
              <h4>Down (1)</h4>
              <div className={styles.tags}>
                <span>Пётр Орлов</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h4>Действия</h4>
            <Button variant="outline" fullWidth>
              Копировать ссылку
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
