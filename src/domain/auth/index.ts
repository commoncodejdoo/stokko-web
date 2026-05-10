import { httpClient } from '@/data/common/http-client';
import { HttpAuthRepository } from '@/data/auth/auth.repository';
import { AuthService } from './auth.service';

export * from './auth.errors';
export * from './auth.repository';
export * from './auth.service';
export * from './user.domain';

/**
 * Composition root for the auth feature.
 */
export const authService = new AuthService(new HttpAuthRepository(httpClient));
