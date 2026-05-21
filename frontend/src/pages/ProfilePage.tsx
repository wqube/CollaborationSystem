import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs';
import { ProfileProjectsCard } from '../components/ProfilePage/ProfileProjectsCard';
import { ProfileSummaryCard } from '../components/ProfilePage/ProfileSummaryCard';
import { Button } from '../components/ui/Button/Button';
import styles from '../assets/ProfilePage.module.css';
import { useLogout } from '../hooks/useLogout';
import { useAppDispatcher, userAppSelector } from '../shared/store/hooks';
import { fetchProjects } from '../shared/store/projectsSlice';

export function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatcher();
  const user = userAppSelector((state) => state.auth.user);
  const { list: projects, loading } = userAppSelector(
    (state) => state.projects,
  );
  const logout = useLogout();

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  return (
    <div className={styles.page}>
      <Breadcrumbs />
      <ProfileSummaryCard user={user} />
      <ProfileProjectsCard
        projects={projects}
        loading={loading}
        onOpenProject={(projectId) => navigate(`/projects/${projectId}`)}
      />

      <div className={styles.logout}>
        <Button
          variant="danger"
          disabled={logout.loading}
          onClick={() => {
            void logout.handleLogout();
          }}
        >
          {logout.loading ? 'Выход...' : 'Выйти'}
        </Button>
      </div>
    </div>
  );
}
