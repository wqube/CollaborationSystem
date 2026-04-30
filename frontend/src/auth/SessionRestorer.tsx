import { useEffect, useState } from 'react';
import { useAppDispatcher } from '../shared/store/hooks';
import { clearAuth, setAuth } from '../shared/store/authSlice';
import apiClient from '../shared/api/client';

interface SessionRestorerProps {
  children: React.ReactNode;
}

export const SessionRestorer = ({ children }: SessionRestorerProps) => {
  const dispatch = useAppDispatcher();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const responce = await apiClient.get('/users/me');
        dispatch(
          setAuth({
            token: '',
            user: responce.data,
          }),
        );
      } catch {
        dispatch(clearAuth());
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);
  if (isLoading) return <div>Загрузка...</div>;
  return <>{children}</>;
};
