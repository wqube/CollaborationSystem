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

export function Breadcrumbs() {
  const location = useLocation();
  const { projectId, suggestionId } = useParams<{
    projectId?: string;
    suggestionId?: string;
  }>();
  const { list: projects } = userAppSelector((state) => state.projects);
  const [suggestionTitle, setSuggestionTitle] = useState('');

  const pathParts = location.pathname.split('/').filter(Boolean);
  const crumbs: Crumb[] = [];

  // Всегда начинаем с "Мои проекты"
  crumbs.push({ label: 'Мои проекты', path: '/projects' });

  // /projects/:id
  if (pathParts.length >= 2 && pathParts[0] === 'projects' && projectId) {
    const project = projects.find((p) => p.id === projectId);
    crumbs.push({
      label: project?.name || 'Проект',
      path: `/projects/${projectId}`,
    });
  }

  // /projects/:id/suggestions или /projects/:id/drafts
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

  // /projects/:id/suggestions/:sId
  if (
    pathParts.length >= 4 &&
    pathParts[0] === 'projects' &&
    pathParts[2] === 'suggestions' &&
    suggestionId
  ) {
    // Загружаем название предложения
    useEffect(() => {
      if (!projectId || !suggestionId) return;
      apiClient
        .get<SuggestionSummary>(
          `/projects/${projectId}/suggestions/${suggestionId}`,
        )
        .then((res) => setSuggestionTitle(res.data.text))
        .catch(() => setSuggestionTitle('Предложение'));
    }, [projectId, suggestionId]);

    crumbs.push({
      label: suggestionTitle || 'Предложение',
      path: location.pathname,
    });
  }

  // /profile
  if (pathParts.length === 1 && pathParts[0] === 'profile') {
    crumbs.push({ label: 'Профиль', path: '/profile' });
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
