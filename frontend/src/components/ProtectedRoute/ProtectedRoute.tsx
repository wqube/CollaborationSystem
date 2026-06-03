import { Navigate, Outlet } from 'react-router-dom';
import { userAppSelector } from '../../shared/store/hooks';

export function ProtectedRoute() {
  const user = userAppSelector((state) => state.auth.user);
  const token = userAppSelector((state) => state.auth.accessToken);
  const initialized = userAppSelector((state) => state.auth.initialized);

  if (!initialized) {
    return <div>Загрузка...</div>;
  }

  if (!token && !user) {
    // if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
