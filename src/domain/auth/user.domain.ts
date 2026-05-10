import { Role } from '../common/role';

/**
 * Authenticated user — the read-only representation of the server's
 * `User` returned by `/auth/login` and `/me`.
 */
export class User {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly email: string,
    readonly role: Role,
    readonly firstName: string,
    readonly lastName: string,
    readonly mustChangePassword: boolean,
    readonly isActive: boolean,
  ) {}

  fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  initials(): string {
    const f = this.firstName[0] ?? '';
    const l = this.lastName[0] ?? '';
    return `${f}${l}`.toUpperCase();
  }
}

export interface Organization {
  id: string;
  name: string;
  currency: string;
}
