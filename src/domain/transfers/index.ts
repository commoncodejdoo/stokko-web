import { httpClient } from '@/data/common/http-client';
import { HttpTransfersRepository } from '@/data/transfers/transfers.repository';
import { TransfersService } from './transfers.service';

export * from './stock-transfer.domain';
export * from './transfers.repository';
export * from './transfers.service';

export const transfersService = new TransfersService(new HttpTransfersRepository(httpClient));
