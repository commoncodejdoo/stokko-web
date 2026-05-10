import { AxiosInstance } from 'axios';
import { User } from '@/domain/users/user.domain';
import {
  InviteUserPayload,
  InviteUserResult,
  ResetPasswordResult,
  UpdateUserPayload,
  UsersRepository,
} from '@/domain/users/users.repository';
import {
  InviteUserResponseDto,
  ResetPasswordResponseDto,
  UserDto,
  UsersListDto,
} from './users.dto';

const fromDto = (d: UserDto): User =>
  new User(
    d.id,
    d.organizationId,
    d.email,
    d.role,
    d.firstName,
    d.lastName,
    d.fullName,
    d.initials,
    d.mustChangePassword,
    d.isActive,
  );

export class HttpUsersRepository implements UsersRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(): Promise<User[]> {
    const { data } = await this.http.get<UsersListDto>('/users');
    return data.items.map(fromDto);
  }

  async invite(payload: InviteUserPayload): Promise<InviteUserResult> {
    const { data } = await this.http.post<InviteUserResponseDto>('/users', payload);
    return { user: fromDto(data.user), temporaryPassword: data.temporaryPassword };
  }

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await this.http.patch<UserDto>(`/users/${id}`, payload);
    return fromDto(data);
  }

  async deactivate(id: string): Promise<User> {
    const { data } = await this.http.post<UserDto>(`/users/${id}/deactivate`);
    return fromDto(data);
  }

  async reactivate(id: string): Promise<User> {
    const { data } = await this.http.post<UserDto>(`/users/${id}/reactivate`);
    return fromDto(data);
  }

  async resetPassword(id: string): Promise<ResetPasswordResult> {
    const { data } = await this.http.post<ResetPasswordResponseDto>(
      `/users/${id}/reset-password`,
    );
    return { user: fromDto(data.user), temporaryPassword: data.temporaryPassword };
  }
}
