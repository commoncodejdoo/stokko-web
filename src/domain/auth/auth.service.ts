import {
  AuthRepository,
  ForcedPasswordChangeResult,
  LoginResult,
  MeResult,
  SessionTokens,
} from './auth.repository';

/**
 * AuthService — thin facade over the repository so view-layer hooks
 * always go through the domain instead of touching the repository directly.
 */
export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  login(email: string, password: string): Promise<LoginResult> {
    return this.repo.login(email, password);
  }

  refresh(refreshToken: string): Promise<SessionTokens> {
    return this.repo.refresh(refreshToken);
  }

  forcedPasswordChange(
    passwordChangeToken: string,
    newPassword: string,
  ): Promise<ForcedPasswordChangeResult> {
    return this.repo.forcedPasswordChange(passwordChangeToken, newPassword);
  }

  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.repo.changePassword(currentPassword, newPassword);
  }

  me(): Promise<MeResult> {
    return this.repo.me();
  }
}
