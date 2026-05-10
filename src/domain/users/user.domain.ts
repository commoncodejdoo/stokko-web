import { Role } from '../common/role';

/**
 * User — read-only mirror of the backend `toPublic()` shape returned by
 * /users endpoints. Carries denormalized `fullName` and `initials` from the
 * backend so consumers don't need to recompute them.
 *
 * (Note: this is distinct from `domain/auth/user.domain.ts`'s `User`, which
 *  is the auth-session user. Kept separate to match mobile's split.)
 */
export class User {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly email: string,
    readonly role: Role,
    readonly firstName: string,
    readonly lastName: string,
    readonly fullName: string,
    readonly initials: string,
    readonly mustChangePassword: boolean,
    readonly isActive: boolean,
  ) {}
}
