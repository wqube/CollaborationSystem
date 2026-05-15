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
  const crumbs: Crumb[] = [];

  // 1. Страница профиля – строим крошки из previousPath
  if (pathParts.length === 1 && pathParts[0] === 'profile') {
    if (previousPath) {
      const prevParts = previousPath.split('/').filter(Boolean);
      // Строим базовые крошки до последнего значимого сегмента
      const baseCrumbs = useCrumbsFromPath(previousPath, projects, true);

      // Определяем, нужно ли добавить название предложения
      const isSuggestionDetail =
        prevParts.length >= 4 &&
        prevParts[0] === 'projects' &&
        prevParts[2] === 'suggestions';

      if (isSuggestionDetail) {
        const prevProjectId = prevParts[1];
        const prevSuggestionId = prevParts[3];
        // Загружаем название предложения
        useEffect(() => {
          if (!prevProjectId || !prevSuggestionId) return;
          apiClient
            .get<SuggestionSummary>(
              `/projects/${prevProjectId}/suggestions/${prevSuggestionId}`,
            )
            .then((res) => setProfileSourceTitle(res.data.text))
            .catch(() => setProfileSourceTitle('Предложение'));
        }, [prevProjectId, prevSuggestionId]);

        if (profileSourceTitle) {
          baseCrumbs.push({
            label: profileSourceTitle,
            path: `/projects/${prevProjectId}/suggestions/${prevSuggestionId}`,
          });
        }
      }

      crumbs.push(...baseCrumbs);
    } else {
      // Если нет previousPath, показываем только Мои проекты -> Профиль
      crumbs.push({ label: 'Мои проекты', path: '/projects' });
    }
    crumbs.push({ label: 'Профиль', path: '/profile' });
  }
  // 2. Обычные страницы
  else {
    crumbs.push({ label: 'Мои проекты', path: '/projects' });

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
      useEffect(() => {
        if (!projectId || !suggestionId) return;
        apiClient
          .get<SuggestionSummary>(
            `/projects/${projectId}/suggestions/${suggestionId}`,
          )
          .then((res) => setSuggestionTitle(res.data.text))
          .catch(() => setSuggestionTitle('Предложение'));
      }, [projectId, suggestionId]);

      // Если пришли со списка предложений, крошка "Все предложения" уже добавлена
      if (!previousPath.includes('/suggestions')) {
        // Удалим предпоследний элемент (Все предложения) и добавим заново, если нужно
      }
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
