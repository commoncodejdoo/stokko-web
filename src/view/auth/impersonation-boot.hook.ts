import { authService } from '@/domain/auth';
import { useAuthStore } from '@/view/common/store/auth-store';
import { toast } from '@/view/common/components/toast.component';

interface ImpersonationJwtPayload {
  userId: string;
  organizationId: string;
  role: 'OWNER' | 'ADMIN' | 'EMPLOYEE';
  readOnly?: boolean;
  impersonatedBy?: string;
  exp: number; // seconds
}

/**
 * A3 — when a `#impersonate=<token>` URL hash is present (set by the
 * stokko-admin "Otvori kao Vlasnik" flow), bootstrap a read-only session.
 *
 * The hash is stripped from the URL immediately to avoid leaking the token
 * via copy/paste, browser history, or referer headers.
 *
 * Run once at app start (from `main.tsx`) — must execute before the router
 * mounts so the unauthenticated guard does not redirect to /login first.
 */
export function bootImpersonationFromHash(): void {
  const match = window.location.hash.match(/[#&]impersonate=([^&]+)/);
  if (!match) return;

  const token = decodeURIComponent(match[1]);
  history.replaceState(null, '', window.location.pathname + window.location.search);

  const payload = safeDecodeJwt(token);
  if (!payload || !payload.readOnly) {
    toast.error('Nevažeći impersonation token');
    return;
  }
  const expiresAt = payload.exp * 1000;
  if (expiresAt < Date.now()) {
    toast.error('Impersonation token je istekao');
    return;
  }

  const store = useAuthStore.getState();
  store.updateTokens(token, '');

  authService
    .me()
    .then((me) => {
      store.setImpersonationSession({
        accessToken: token,
        user: me.user,
        organization: me.organization,
        impersonatedBy: payload.impersonatedBy ?? null,
        expiresAt,
      });
    })
    .catch(() => {
      store.clearSession();
      toast.error('Pokretanje sesije nije uspjelo');
    });
}

function safeDecodeJwt(token: string): ImpersonationJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(atob(padded)) as ImpersonationJwtPayload;
  } catch {
    return null;
  }
}
