import { AxiosError, AxiosInstance } from 'axios';
import {
  InvalidCredentialsError,
  NetworkError,
  PasswordChangeTokenInvalidError,
  RefreshTokenInvalidError,
  UnexpectedAuthError,
  WeakPasswordError,
} from '@/domain/auth/auth.errors';
import {
  AuthRepository,
  ForcedPasswordChangeResult,
  LoginResult,
  MeResult,
  SessionTokens,
} from '@/domain/auth/auth.repository';
import {
  ForcedPasswordChangeResponseDto,
  LoginResponseDto,
  MeResponseDto,
  ServerErrorDto,
  SessionTokensDto,
} from './auth.dto';
import { organizationFromDto, userFromDto } from './auth.mapper';

/**
 * HTTP implementation of the auth repository. Talks to the Stokko backend.
 */
export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly http: AxiosInstance) {}

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const { data } = await this.http.post<LoginResponseDto>('/auth/login', {
        email,
        password,
      });
      if (data.requirePasswordChange) {
        return {
          requirePasswordChange: true,
          passwordChangeToken: data.passwordChangeToken,
          user: userFromDto(data.user),
        };
      }
      return {
        requirePasswordChange: false,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: userFromDto(data.user),
      };
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async refresh(refreshToken: string): Promise<SessionTokens> {
    try {
      const { data } = await this.http.post<SessionTokensDto>('/auth/refresh', {
        refreshToken,
      });
      return { accessToken: data.accessToken, refreshToken: data.refreshToken };
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async forcedPasswordChange(
    passwordChangeToken: string,
    newPassword: string,
  ): Promise<ForcedPasswordChangeResult> {
    try {
      const { data } = await this.http.post<ForcedPasswordChangeResponseDto>(
        '/auth/forced-password-change',
        { passwordChangeToken, newPassword },
      );
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: userFromDto(data.user),
      };
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.http.post('/auth/change-password', { currentPassword, newPassword });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async me(): Promise<MeResult> {
    try {
      const { data } = await this.http.get<MeResponseDto>('/me');
      return {
        user: userFromDto(data.user),
        organization: organizationFromDto(data.organization),
      };
    } catch (err) {
      throw this.mapError(err);
    }
  }

  private mapError(err: unknown): Error {
    if (err instanceof AxiosError) {
      if (!err.response) return new NetworkError();

      const body = err.response.data as Partial<ServerErrorDto> | undefined;
      switch (body?.code) {
        case 'INVALID_CREDENTIALS':
          return new InvalidCredentialsError();
        case 'WEAK_PASSWORD':
          return new WeakPasswordError();
        case 'REFRESH_TOKEN_INVALID':
          return new RefreshTokenInvalidError();
        case 'PASSWORD_CHANGE_TOKEN_INVALID':
          return new PasswordChangeTokenInvalidError();
        default:
          return new UnexpectedAuthError(body?.message);
      }
    }
    return new UnexpectedAuthError(err instanceof Error ? err.message : undefined);
  }
}
