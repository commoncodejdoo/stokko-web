import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/view/common/store/auth-store';
import { useOnboardingStore } from '@/view/common/store/onboarding-store';
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
 * If onboarding was never seen, redirect to /onboarding (unless we're already there).
 */
export function RedirectIfAuthenticated() {
  const status = useAuthStore((s) => s.status);
  const onboardingSeen = useOnboardingStore((s) => s.seen);
  const location = useLocation();

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }
  if (!onboardingSeen && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}
