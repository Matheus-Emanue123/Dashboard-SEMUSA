import { Module } from '@nestjs/common';
import { IepsClient } from './ieps.client';
import { IepsDataController } from './ieps-data.controller';
import { IepsDataService } from './ieps-data.service';

@Module({
  controllers: [IepsDataController],
  providers: [IepsDataService, { provide: IepsClient, useFactory: () => new IepsClient() }],
})
export class IepsDataModule {}
