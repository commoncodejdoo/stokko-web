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

export interface UsersListDto {
  items: UserDto[];
}

export interface InviteUserResponseDto {
  user: UserDto;
  temporaryPassword: string;
}

export type ResetPasswordResponseDto = InviteUserResponseDto;
