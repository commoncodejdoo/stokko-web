import { useEffect, useRef } from 'react';
import { authService } from '@/domain/auth';
import { useAuthStore } from '@/view/common/store/auth-store';

/**
 * On app boot: if the persisted store has tokens but is in `hydrating` state,
 * call /me to validate the session (and refresh user/org). Falls back to
 * `unauthenticated` if validation fails.
 */
export function useHydrateSession() {
  const status = useAuthStore((s) => s.status);
  const accessToken = useAuthStore((s) => s.accessToken);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    if (status !== 'hydrating') return;
    ran.current = true;

    const store = useAuthStore.getState();
    if (!accessToken) {
      store.markUnauthenticated();
      return;
    }

    authService
      .me()
      .then((me) => {
        store.setUserAndOrg(me.user, me.organization);
        store.markAuthenticated();
      })
      .catch(() => {
        store.clearSession();
      });
  }, [status, accessToken]);
}
