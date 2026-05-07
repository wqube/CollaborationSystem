import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import { useAppDispatcher, userAppSelector } from '../../shared/store/hooks';
import { fetchProjects } from '../../shared/store/projectsSlice';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatcher();
  const user = userAppSelector((state) => state.auth.user);
  const { list: projects } = userAppSelector((state) => state.projects);

  // Загружаем проекты при монтировании
  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  // Определяем, на странице проекта или нет
  const pathParts = location.pathname.split('/').filter(Boolean);
  // /projects/:id → ['projects', 'id']
  const isProjectPage = pathParts.length === 2 && pathParts[0] === 'projects';

  const getInitials = (name: string): string => {
    return name
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = user?.displayName || 'Гость';
  const userInitials = user ? getInitials(user.displayName) : 'Г';

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    if (newId) {
      navigate(`/projects/${newId}`);
    }
  };

  return (
    <header className={styles.app_header}>
      <div className={styles.left}>
        <div className={styles.logo} onClick={() => navigate('/projects')}>
          <img src="/T-Bank-Logo.png" width={36} height={36} alt="Лого" />
          <span>Система совместной работы</span>
        </div>

        {isProjectPage && projects.length > 0 && (
          <select
            className={styles.projectSelector}
            value=""
            onChange={handleProjectChange}
          >
            <option value="">Выберите проект</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className={styles.user}>
        <span
          className={styles.text_small}
          onClick={() => navigate('/profile')}
        >
          {userName}
        </span>
        <div
          className={styles.user_avatar}
          onClick={() => navigate('/profile')}
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
}
