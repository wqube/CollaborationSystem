import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import { Badge } from '../components/ui/Badge/Badge';
import { useAppDispatcher, userAppSelector } from '../shared/store/hooks';
import { clearProjects, fetchProjects } from '../shared/store/projectsSlice';
import { clearAuth } from '../shared/store/authSlice';
import { logout } from '../shared/api/auth';
import { getProjectRoleBadgeVariant } from '../shared/utils/projectRole';
import styles from '../assets/ProfilePage.module.css';
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs';

export function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatcher();
  const user = userAppSelector((s) => s.auth.user);
  const { list: projects, loading } = userAppSelector((s) => s.projects);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      await logout();
    } catch (error) {
      console.error('Ошибка выхода из системы', error);
    } finally {
      dispatch(clearAuth());
      dispatch(clearProjects());
      navigate('/auth/login', { replace: true });
    }
  };

  return (
    <div className={styles.page}>
      <Breadcrumbs />
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
        {loading && <p className={styles.loading}>Загрузка...</p>}
        {!loading && projects.length === 0 && (
          <p className={styles.empty}>Нет проектов</p>
        )}
        <div className={styles.projectList}>
          {projects.map((p) => (
            <div
              key={p.id}
              className={styles.projectItem}
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <div>
                <strong className={styles.projectName}>{p.name}</strong>
                <span className={styles.projectDesc}>{p.description}</span>
              </div>
              <Badge variant={getProjectRoleBadgeVariant(p.role)} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.logout}>
        <Button
          variant="danger"
          disabled={logoutLoading}
          onClick={() => {
            void handleLogout();
          }}
        >
          {logoutLoading ? 'Выход...' : 'Выйти'}
        </Button>
      </div>
    </div>
  );
}
