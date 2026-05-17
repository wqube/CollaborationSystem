import { useEffect, useState } from 'react';
import { useAppDispatcher } from '../shared/store/hooks';
import { clearAuth, setAuth } from '../shared/store/authSlice';
import { refresh } from '../shared/api/auth';

interface SessionRestorerProps {
  children: React.ReactNode;
}

export const SessionRestorer = ({ children }: SessionRestorerProps) => {
  const dispatch = useAppDispatcher();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await refresh();
        dispatch(
          setAuth({
            token: response.accessToken,
            user: response.user,
          }),
        );
      } catch {
        dispatch(clearAuth());
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, [dispatch]);
  if (isLoading) return <div>Загрузка...</div>;
  return <>{children}</>;
};
