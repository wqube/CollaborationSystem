import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import apiClient from '../../shared/api/client';

export function SmartRedirect() {
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get('/projects')
      .then((res) => {
        const projects: Array<{ id: string; lastAccessedAt: string }> =
          res.data.items ?? [];

        if (projects.length === 0) {
          setRedirectTo('/projects');
          return;
        }

        const lastProject = projects.reduce((prev, curr) =>
          new Date(curr.lastAccessedAt) > new Date(prev.lastAccessedAt)
            ? curr
            : prev,
        );
        setRedirectTo(`/projects/${lastProject.id}`);
      })
      .catch(() => {
        // apiClient interceptor сам обработает 401 и редирект на /auth/login
        // сюда попадём только если refresh тоже не удался
        setRedirectTo('/projects');
      });
  }, []);

  if (!redirectTo) return null;
  return <Navigate to={redirectTo} replace />;
}
