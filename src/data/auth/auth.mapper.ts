import { Organization, User } from '@/domain/auth/user.domain';
import { OrganizationDto, UserDto } from './auth.dto';

export const userFromDto = (dto: UserDto): User =>
  new User(
    dto.id,
    dto.organizationId,
    dto.email,
    dto.role,
    dto.firstName,
    dto.lastName,
    dto.mustChangePassword,
    dto.isActive,
  );

export const organizationFromDto = (dto: OrganizationDto): Organization => ({
  id: dto.id,
  name: dto.name,
  currency: dto.currency,
});
