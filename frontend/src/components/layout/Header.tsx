import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';
import { userAppSelector, useAppDispatcher } from '../../shared/store/hooks';
import { fetchProjects } from '../../shared/store/projectsSlice';
import apiClient from '../../shared/api/client';
import type { ProjectSummary, SuggestionSummary } from '../../types/api';

// Карта путей для статичных страниц
const PATH_LABELS: Record<string, string> = {
  projects: 'Мои проекты',
  profile: 'Профиль',
  drafts: 'Черновики',
  suggestions: 'Все предложения',
};

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatcher();
  const { projectId, suggestionId } = useParams<{
    projectId?: string;
    suggestionId?: string;
  }>();

  const user = userAppSelector((state) => state.auth.user);
  const { list: projects } = userAppSelector((state) => state.projects);
  const [projectName, setProjectName] = useState<string>('');
  const [suggestionTitle, setSuggestionTitle] = useState<string>('');

  // Загружаем список проектов при старте
  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  // Получаем название проекта из Redux
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setProjectName(project.name);
      }
    }
  }, [projectId, projects]);

  // Загружаем название предложения, если есть suggestionId
  useEffect(() => {
    if (!projectId || !suggestionId) {
      setSuggestionTitle('');
      return;
    }

    apiClient
      .get<SuggestionSummary>(
        `/projects/${projectId}/suggestions/${suggestionId}`,
      )
      .then((res) => setSuggestionTitle(res.data.text))
      .catch(() => setSuggestionTitle(''));
  }, [projectId, suggestionId]);

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

  const pathParts = location.pathname.split('/').filter(Boolean);
  let breadcrumb = '';

  if (pathParts.length === 0) {
    breadcrumb = '';
  } else if (pathParts.length === 1) {
    // /projects или /profile
    breadcrumb = PATH_LABELS[pathParts[0]] || '';
  } else if (pathParts[0] === 'projects' && pathParts.length === 2) {
    // /projects/:id — страница доски → название проекта
    breadcrumb = projectName || PATH_LABELS['projects'];
  } else if (pathParts[0] === 'projects' && pathParts.length === 3) {
    // /projects/:id/suggestions или /projects/:id/drafts
    breadcrumb = PATH_LABELS[pathParts[2]] || '';
  } else if (pathParts[0] === 'projects' && pathParts.length === 4) {
    // /projects/:id/suggestions/:sId → название предложения
    breadcrumb = suggestionTitle || PATH_LABELS['suggestions'];
  }

  return (
    <header className={styles.app_header}>
      <div className={styles.logo} onClick={() => navigate('/projects')}>
        <img src="/T-Bank-Logo.png" width={36} height={36} alt="Лого" />
        <span>
          Система совместной работы
          {breadcrumb && (
            <>
              <span className={styles.separator}> / </span>
              {breadcrumb}
            </>
          )}
        </span>
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
