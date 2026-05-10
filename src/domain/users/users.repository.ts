import { Role } from '../common/role';
import { User } from './user.domain';

export interface InviteUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  role?: Role;
}

export interface InviteUserResult {
  user: User;
  /** Plaintext temporary password — show once to the inviter, never store. */
  temporaryPassword: string;
}

export interface ResetPasswordResult {
  user: User;
  temporaryPassword: string;
}

export interface UsersRepository {
  list(): Promise<User[]>;
  invite(payload: InviteUserPayload): Promise<InviteUserResult>;
  update(id: string, payload: UpdateUserPayload): Promise<User>;
  deactivate(id: string): Promise<User>;
  reactivate(id: string): Promise<User>;
  resetPassword(id: string): Promise<ResetPasswordResult>;
}
