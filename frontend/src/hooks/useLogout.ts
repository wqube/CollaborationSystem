import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../shared/api/auth';
import { clearAuth } from '../shared/store/authSlice';
import { useAppDispatcher } from '../shared/store/hooks';
import { clearProjects } from '../shared/store/projectsSlice';

export function useLogout() {
  const dispatch = useAppDispatcher();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoading(true);

    try {
      await logout();
    } catch (error) {
      console.error('Ошибка выхода из системы', error);
    } finally {
      dispatch(clearAuth());
      dispatch(clearProjects());
      navigate('/auth/login', { replace: true });
    }
  }, [dispatch, navigate]);

  return {
    loading,
    handleLogout,
  };
}
