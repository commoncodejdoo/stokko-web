import { User } from './user.domain';
import {
  InviteUserPayload,
  InviteUserResult,
  ResetPasswordResult,
  UpdateUserPayload,
  UsersRepository,
} from './users.repository';

export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  list(): Promise<User[]> {
    return this.repo.list();
  }

  invite(payload: InviteUserPayload): Promise<InviteUserResult> {
    return this.repo.invite(payload);
  }

  update(id: string, payload: UpdateUserPayload): Promise<User> {
    return this.repo.update(id, payload);
  }

  deactivate(id: string): Promise<User> {
    return this.repo.deactivate(id);
  }

  reactivate(id: string): Promise<User> {
    return this.repo.reactivate(id);
  }

  resetPassword(id: string): Promise<ResetPasswordResult> {
    return this.repo.resetPassword(id);
  }
}
