// Breadcrumbs.tsx (итоговая версия)
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

// Функция построения крошек по произвольному пути
function useCrumbsFromPath(
  path: string,
  projects: any[],
  skipLast: boolean = false,
) {
  const parts = path.split('/').filter(Boolean);
  const crumbs: Crumb[] = [{ label: 'Мои проекты', path: '/projects' }];

  if (parts[0] !== 'projects' || parts.length < 2) return crumbs;

  const projectId = parts[1];
  const project = projects.find((p) => p.id === projectId);
  crumbs.push({
    label: project?.name || 'Проект',
    path: `/projects/${projectId}`,
  });

  if (parts.length >= 3) {
    const sectionMap: Record<string, string> = {
      suggestions: 'Все предложения',
      drafts: 'Черновики',
    };
    const section = sectionMap[parts[2]] || parts[2];
    if (!skipLast || parts.length > 3) {
      crumbs.push({
        label: section,
        path: `/${parts.slice(0, 3).join('/')}`,
      });
    }
  }

  return crumbs;
}

export function Breadcrumbs() {
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

  useEffect(() => {
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
  }, [location.pathname, projectId, suggestionId]);

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
      const prevCrumbs = useCrumbsFromPath(previousPath, projects, true);
      crumbs.push(...prevCrumbs.slice(1));

      const prevParts = previousPath.split('/').filter(Boolean);
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
    if (pathParts.length >= 2 && pathParts[0] === 'projects' && projectId) {
      const project = projects.find((p) => p.id === projectId);
      crumbs.push({
        label: project?.name || 'Проект',
        path: `/projects/${projectId}`,
      });
    }

    if (pathParts.length >= 3 && pathParts[0] === 'projects') {
      const sectionMap: Record<string, string> = {
        suggestions: 'Все предложения',
        drafts: 'Черновики',
      };
      const section = sectionMap[pathParts[2]] || pathParts[2];
      crumbs.push({
        label: section,
        path: `/${pathParts.slice(0, 3).join('/')}`,
      });
    }

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
