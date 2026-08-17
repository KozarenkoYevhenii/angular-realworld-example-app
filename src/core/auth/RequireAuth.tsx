import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export function RequireAuth() {
  const authState = useAppSelector(state => state.auth.authState);
  const user = useAppSelector(state => state.auth.user);

  if (authState === 'loading') {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
