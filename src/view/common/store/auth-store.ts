import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Organization, User } from '@/domain/auth/user.domain';

export type AuthStatus = 'unhydrated' | 'hydrating' | 'unauthenticated' | 'authenticated';

interface PersistedSlice {
  accessToken: string | null;
  refreshToken: string | null;
  userJson: SerializedUser | null;
  organization: Organization | null;
  /** A3 — set when this session was opened via platform-admin impersonation. */
  readOnly: boolean;
  impersonatedBy: string | null;
  readOnlyExpiresAt: number | null;
}

interface AuthState extends PersistedSlice {
  status: AuthStatus;
  user: User | null;
}

interface AuthActions {
  setSession(payload: {
    accessToken: string;
    refreshToken: string;
    user: User;
    organization: Organization;
  }): void;
  /** A3 — establish a read-only impersonation session from a short-lived JWT. */
  setImpersonationSession(payload: {
    accessToken: string;
    user: User;
    organization: Organization;
    impersonatedBy: string | null;
    expiresAt: number;
  }): void;
  /** Used by the HTTP refresh interceptor — updates tokens without touching user/org. */
  updateTokens(accessToken: string, refreshToken: string): void;
  setUserAndOrg(user: User, organization: Organization): void;
  markAuthenticated(): void;
  markUnauthenticated(): void;
  markHydrating(): void;
  clearSession(): void;
}

interface SerializedUser {
  id: string;
  organizationId: string;
  email: string;
  role: User['role'];
  firstName: string;
  lastName: string;
  mustChangePassword: boolean;
  isActive: boolean;
}

const userToJson = (u: User): SerializedUser => ({
  id: u.id,
  organizationId: u.organizationId,
  email: u.email,
  role: u.role,
  firstName: u.firstName,
  lastName: u.lastName,
  mustChangePassword: u.mustChangePassword,
  isActive: u.isActive,
});

const userFromJson = (s: SerializedUser): User =>
  new User(
    s.id,
    s.organizationId,
    s.email,
    s.role,
    s.firstName,
    s.lastName,
    s.mustChangePassword,
    s.isActive,
  );

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      status: 'unhydrated',
      accessToken: null,
      refreshToken: null,
      userJson: null,
      user: null,
      organization: null,
      readOnly: false,
      impersonatedBy: null,
      readOnlyExpiresAt: null,

      setSession({ accessToken, refreshToken, user, organization }) {
        set({
          accessToken,
          refreshToken,
          userJson: userToJson(user),
          user,
          organization,
          status: 'authenticated',
          readOnly: false,
          impersonatedBy: null,
          readOnlyExpiresAt: null,
        });
      },

      setImpersonationSession({ accessToken, user, organization, impersonatedBy, expiresAt }) {
        set({
          accessToken,
          refreshToken: null,
          userJson: userToJson(user),
          user,
          organization,
          status: 'authenticated',
          readOnly: true,
          impersonatedBy,
          readOnlyExpiresAt: expiresAt,
        });
      },

      updateTokens(accessToken, refreshToken) {
        set({ accessToken, refreshToken });
      },

      setUserAndOrg(user, organization) {
        set({ user, userJson: userToJson(user), organization });
      },

      markAuthenticated() {
        set({ status: 'authenticated' });
      },

      markUnauthenticated() {
        set({
          status: 'unauthenticated',
          accessToken: null,
          refreshToken: null,
          user: null,
          userJson: null,
          organization: null,
          readOnly: false,
          impersonatedBy: null,
          readOnlyExpiresAt: null,
        });
      },

      markHydrating() {
        if (get().status === 'unhydrated') {
          set({ status: 'hydrating' });
        }
      },

      clearSession() {
        set({
          status: 'unauthenticated',
          accessToken: null,
          refreshToken: null,
          user: null,
          userJson: null,
          organization: null,
          readOnly: false,
          impersonatedBy: null,
          readOnlyExpiresAt: null,
        });
      },
    }),
    {
      name: 'stokko-web-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedSlice => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userJson: state.userJson,
        organization: state.organization,
        readOnly: state.readOnly,
        impersonatedBy: state.impersonatedBy,
        readOnlyExpiresAt: state.readOnlyExpiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.userJson) {
          state.user = userFromJson(state.userJson);
        }
        state.status = state.accessToken ? 'hydrating' : 'unauthenticated';
      },
    },
  ),
);
