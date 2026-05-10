import { Role } from '@/domain/common/role';

export interface UserDto {
  id: string;
  organizationId: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  mustChangePassword: boolean;
  isActive: boolean;
}

export interface OrganizationDto {
  id: string;
  name: string;
  currency: string;
}

export type LoginResponseDto =
  | {
      requirePasswordChange: false;
      accessToken: string;
      refreshToken: string;
      user: UserDto;
    }
  | {
      requirePasswordChange: true;
      passwordChangeToken: string;
      user: UserDto;
    };

export interface SessionTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface ForcedPasswordChangeResponseDto extends SessionTokensDto {
  user: UserDto;
}

export interface MeResponseDto {
  user: UserDto;
  organization: OrganizationDto;
}

export interface ServerErrorDto {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
}
