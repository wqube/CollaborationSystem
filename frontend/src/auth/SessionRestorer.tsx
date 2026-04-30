import { useEffect, useState } from 'react';
import { useAppDispatcher } from '../shared/store/hooks';
import { clearAuth, setAuth } from '../shared/store/authSlice';
import apiClient from '../shared/api/client';
import { store } from '../shared/store';

interface SessionRestorerProps {
  children: React.ReactNode;
}

export const SessionRestorer = ({ children }: SessionRestorerProps) => {
  const dispatch = useAppDispatcher();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      console.log('SessionRestorer: starting restore...');
      try {
        const responce = await apiClient.get('/users/me');
        console.log('SessionRestorer: got user', responce.data);
        dispatch(
          setAuth({
            token: store.getState().auth.accessToken ?? '',
            user: responce.data,
          }),
        );
      } catch {
        // refresh тоже не удался — пользователь не авторизован
        console.log('SessionRestorer: failed, clearing auth');
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
