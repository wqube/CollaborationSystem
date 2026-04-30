import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export function SmartRedirect() {
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    fetch('/api/v1/projects', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
      })
      .then((data) => {
        const projects: Array<{ id: string; lastAccessedAt: string }> =
          data.items ?? [];

        if (projects.length === 0) {
          setRedirectTo('/projects');
          return;
        }

        // Находим проект с максимальным lastAccessedAt
        const lastProject = projects.reduce((prev, curr) =>
          new Date(curr.lastAccessedAt) > new Date(prev.lastAccessedAt)
            ? curr
            : prev,
        );

        setRedirectTo(`/projects/${lastProject.id}`);
      })
      .catch(() => {
        // При ошибке (например, 401) — отправляем на список проектов,
        // ProtectedRoute сам разберётся с редиректом на логин
        setRedirectTo('/projects');
        console.log('сработал SmartRedirect');
      });
  }, []);

  if (!redirectTo) return null; // нужно заменить на <Spinner />

  return <Navigate to={redirectTo} replace />;
}
