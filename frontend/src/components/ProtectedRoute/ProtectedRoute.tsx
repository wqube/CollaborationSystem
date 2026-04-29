import { Navigate, Outlet } from 'react-router-dom';
import { userAppSelector } from '../../shared/store/hooks';

export function ProtectedRoute() {
  const user = userAppSelector((state) => state.auth.user);
  const token = userAppSelector((state) => state.auth.accessToken);

  if (!token && !user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
