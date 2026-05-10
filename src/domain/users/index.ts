import { httpClient } from '@/data/common/http-client';
import { HttpUsersRepository } from '@/data/users/users.repository';
import { UsersService } from './users.service';

export * from './user.domain';
export * from './users.repository';
export * from './users.service';

export const usersService = new UsersService(new HttpUsersRepository(httpClient));
