import { Organization, User } from './user.domain';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export type LoginResult =
  | {
      requirePasswordChange: false;
      accessToken: string;
      refreshToken: string;
      user: User;
    }
  | {
      requirePasswordChange: true;
      passwordChangeToken: string;
      user: User;
    };

export interface ForcedPasswordChangeResult extends SessionTokens {
  user: User;
}

export interface MeResult {
  user: User;
  organization: Organization;
}

/**
 * Auth repository — the data layer's contract for talking to the
 * Stokko `/auth/*` endpoints. The HTTP implementation lives in
 * `data/auth/auth.repository.ts`.
 */
export interface AuthRepository {
  login(email: string, password: string): Promise<LoginResult>;
  refresh(refreshToken: string): Promise<SessionTokens>;
  forcedPasswordChange(
    passwordChangeToken: string,
    newPassword: string,
  ): Promise<ForcedPasswordChangeResult>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  me(): Promise<MeResult>;
}
