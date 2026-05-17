import { useLocation, useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { userAppSelector } from '../../shared/store/hooks';
import apiClient from '../../shared/api/client';
import type { SuggestionSummary } from '../../types/api';
import styles from './Breadcrumbs.module.css';

interface Crumb {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  currentSuggestionTitle?: string;
}

export function Breadcrumbs({ currentSuggestionTitle }: BreadcrumbsProps) {
  const location = useLocation();
  const { projectId, suggestionId } = useParams<{
    projectId?: string;
    suggestionId?: string;
  }>();
  const { list: projects } = userAppSelector((state) => state.projects);
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [profileSourceTitle, setProfileSourceTitle] = useState('');
  const previousPath = (location.state as { from?: string })?.from || '';

  const pathParts = location.pathname.split('/').filter(Boolean);
  const crumbs: Crumb[] = [{ label: 'Мои проекты', path: '/projects' }];

  // Загружаем название предложения для страницы детализации
  useEffect(() => {
    if (currentSuggestionTitle) {
      setSuggestionTitle(currentSuggestionTitle);
      return;
    }

    if (
      pathParts.length >= 4 &&
      pathParts[0] === 'projects' &&
      pathParts[2] === 'suggestions' &&
      projectId &&
      suggestionId
    ) {
      apiClient
        .get<SuggestionSummary>(
          `/projects/${projectId}/suggestions/${suggestionId}`,
        )
        .then((res) => setSuggestionTitle(res.data.text))
        .catch(() => setSuggestionTitle('Предложение'));
      return;
    }

    setSuggestionTitle('');
  }, [currentSuggestionTitle, location.pathname, projectId, suggestionId]);

  // Загружаем название предложения для страницы профиля
  useEffect(() => {
    if (pathParts.length === 1 && pathParts[0] === 'profile' && previousPath) {
      const prevParts = previousPath.split('/').filter(Boolean);

      if (
        prevParts.length >= 4 &&
        prevParts[0] === 'projects' &&
        prevParts[2] === 'suggestions'
      ) {
        const prevProjectId = prevParts[1];
        const prevSuggestionId = prevParts[3];

        apiClient
          .get<SuggestionSummary>(
            `/projects/${prevProjectId}/suggestions/${prevSuggestionId}`,
          )
          .then((res) => setProfileSourceTitle(res.data.text))
          .catch(() => setProfileSourceTitle('Предложение'));
        return;
      }
    }

    setProfileSourceTitle('');
  }, [location.pathname, previousPath]);

  const isProfilePage = pathParts.length === 1 && pathParts[0] === 'profile';

  if (isProfilePage) {
    if (previousPath) {
      const prevParts = previousPath.split('/').filter(Boolean);

      if (prevParts.length >= 2 && prevParts[0] === 'projects') {
        const prevProjectId = prevParts[1];
        const project = projects.find((p) => p.id === prevProjectId);
        crumbs.push({
          label: project?.name || 'Проект',
          path: `/projects/${prevProjectId}`,
        });
      }

      if (
        prevParts.length === 3 &&
        prevParts[0] === 'projects' &&
        prevParts[2] === 'drafts'
      ) {
        crumbs.push({
          label: 'Черновики',
          path: `/${prevParts.join('/')}`,
        });
      }

      const isSuggestionDetail =
        prevParts.length >= 4 &&
        prevParts[0] === 'projects' &&
        prevParts[2] === 'suggestions';

      if (isSuggestionDetail) {
        const prevProjectId = prevParts[1];
        const prevSuggestionId = prevParts[3];

        crumbs.push({
          label: profileSourceTitle || 'Предложение',
          path: `/projects/${prevProjectId}/suggestions/${prevSuggestionId}`,
        });
      }
    }

    crumbs.push({ label: 'Профиль', path: '/profile' });
  } else {
    // ← ЭТОГО БЛОКА НЕ БЫЛО
    // Обычные страницы (не профиль)
    if (pathParts.length >= 2 && pathParts[0] === 'projects' && projectId) {
      const project = projects.find((p) => p.id === projectId);
      crumbs.push({
        label: project?.name || 'Проект',
        path: `/projects/${projectId}`,
      });
    }

    // Черновики
    if (
      pathParts.length === 3 &&
      pathParts[0] === 'projects' &&
      pathParts[2] === 'drafts'
    ) {
      crumbs.push({
        label: 'Черновики',
        path: `/${pathParts.join('/')}`,
      });
    }

    // Предложение
    if (
      pathParts.length >= 4 &&
      pathParts[0] === 'projects' &&
      pathParts[2] === 'suggestions' &&
      suggestionId
    ) {
      crumbs.push({
        label: suggestionTitle || 'Предложение',
        path: location.pathname,
      });
    }
  }

  return (
    <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
      {crumbs.map((crumb, index) => (
        <span key={crumb.path} className={styles.crumbWrapper}>
          {index > 0 && <span className={styles.separator}> / </span>}
          {index < crumbs.length - 1 ? (
            <Link to={crumb.path} className={styles.link}>
              {crumb.label}
            </Link>
          ) : (
            <span className={styles.current}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
