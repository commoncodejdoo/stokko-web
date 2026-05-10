import { useMutation } from '@tanstack/react-query';
import { authService } from '@/domain/auth';
import { useAuthStore } from '@/view/common/store/auth-store';
import { analytics } from '@/view/common/analytics';

export interface LoginVariables {
  email: string;
  password: string;
}

export interface ForcedPwdChangeVariables {
  passwordChangeToken: string;
  newPassword: string;
}

/**
 * Login mutation. On success, the caller decides:
 *  - `requirePasswordChange: true`  → navigate to /forced-password-change
 *  - `requirePasswordChange: false` → call `useFinalizeLoginSession` to fetch /me + persist
 */
export const useLogin = () =>
  useMutation({
    mutationFn: (vars: LoginVariables) => authService.login(vars.email, vars.password),
  });

/**
 * Step that runs after a successful login (or forced password change):
 * stash the new tokens FIRST so the request interceptor can attach
 * `Authorization: Bearer ...`, then call `/me` to fetch org details,
 * then commit the full session.
 *
 * Without this ordering, `/me` goes out without a Bearer header (the
 * store still has `accessToken: null`) and the JWT guard returns 401.
 */
async function finalizeSession(tokens: { accessToken: string; refreshToken: string }) {
  const store = useAuthStore.getState();

  // 1. Stash tokens so the http-client interceptor injects them.
  store.updateTokens(tokens.accessToken, tokens.refreshToken);

  try {
    // 2. Fetch user + org details using the new access token.
    const me = await authService.me();

    // 3. Commit the full session — flips status to 'authenticated'.
    store.setSession({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: me.user,
      organization: me.organization,
    });
    analytics.identify(me.user, me.organization);
  } catch (err) {
    // /me failed for some reason — roll back so we don't end up
    // half-authenticated (tokens persisted but no user/org).
    store.clearSession();
    throw err;
  }
}

export const useForcedPasswordChange = () =>
  useMutation({
    mutationFn: async (vars: ForcedPwdChangeVariables) => {
      const result = await authService.forcedPasswordChange(
        vars.passwordChangeToken,
        vars.newPassword,
      );
      await finalizeSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      return result;
    },
  });

export const useFinalizeLoginSession = () =>
  useMutation({
    mutationFn: (vars: { accessToken: string; refreshToken: string }) => finalizeSession(vars),
  });
