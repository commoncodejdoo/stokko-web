/**
 * User role within an organization. Mirrors the backend enum.
 */
export type Role = 'OWNER' | 'ADMIN' | 'EMPLOYEE';

export const ALL_ROLES: Role[] = ['OWNER', 'ADMIN', 'EMPLOYEE'];

export const ROLE_LABELS_HR: Record<Role, string> = {
  OWNER: 'Vlasnik',
  ADMIN: 'Admin',
  EMPLOYEE: 'Zaposlenik',
};

export const canManageUsers = (role: Role): boolean => role === 'OWNER';
export const canEditCatalog = (role: Role): boolean => role === 'OWNER' || role === 'ADMIN';
export const canTransfer = (role: Role): boolean => role === 'OWNER' || role === 'ADMIN';
