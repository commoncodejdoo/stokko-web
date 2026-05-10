import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/view/common/store/auth-store';
import { useHydrateSession } from '@/view/auth/hydrate.hook';
import { SplashScreen } from '@/view/auth/splash.screen';

export function RequireAuth() {
  const status = useAuthStore((s) => s.status);
  useHydrateSession();

  if (status === 'hydrating' || status === 'unhydrated') {
    return <SplashScreen />;
  }
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

/**
 * Inverse — used on /login + /forced-password-change.
 * If already authenticated, redirect to /.
 */
export function RedirectIfAuthenticated() {
  const status = useAuthStore((s) => s.status);
  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
