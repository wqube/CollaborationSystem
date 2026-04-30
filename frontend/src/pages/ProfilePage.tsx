import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { Badge } from '../components/ui/Badge/Badge';
import { userAppSelector } from '../shared/store/hooks';
import styles from '../assets/ProfilePage.module.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const user = userAppSelector((s) => s.auth.user);

  return (
    <div className={styles.page}>
      <h1>Профиль</h1>

      <div className={styles.card}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {user?.displayName
              ?.split(' ')
              .map((w) => w[0])
              .join('') || '?'}
          </div>
          <div>
            <h2>{user?.displayName || 'Гость'}</h2>
            <p className={styles.email}>{user?.email || 'неизвестно'}</p>
            <Badge variant="new">DevLogin</Badge>
          </div>
        </div>
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span>User ID</span>
            <span>{user?.id || '—'}</span>
          </div>
          <div className={styles.detailItem}>
            <span>Auth Mode</span>
            <span>DevLogin</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3>Мои проекты</h3>
        <div className={styles.projectList}>
          {[
            {
              id: '1',
              name: 'Core Platform',
              desc: 'Проект команды Core Platform',
              role: 'Admin' as const,
            },
            {
              id: '2',
              name: 'Mobile App',
              desc: 'iOS / Android разработка',
              role: 'Member' as const,
            },
            {
              id: '3',
              name: 'Support Tools',
              desc: 'Внутренние инструменты',
              role: 'Member' as const,
            },
          ].map((p) => (
            <div
              key={p.id}
              className={styles.projectItem}
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <div>
                <strong>{p.name}</strong>
                <span className={styles.projectDesc}>{p.desc}</span>
              </div>
              <Badge variant={p.role === 'Admin' ? 'admin' : 'member'} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.logout}>
        <Button
          variant="danger"
          onClick={() => {
            localStorage.clear();
            window.location.href = '/auth/login';
          }}
        >
          Выйти
        </Button>
      </div>
    </div>
  );
}
