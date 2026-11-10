import { Module } from '@nestjs/common';
import { PowerBiClient } from './powerbi.client';
import { PowerBiViepController } from './powerbi-viep.controller';
import { PowerBiViepService } from './powerbi-viep.service';

@Module({
  controllers: [PowerBiViepController],
  providers: [PowerBiViepService, { provide: PowerBiClient, useFactory: () => new PowerBiClient() }],
})
export class PowerBiViepModule {}
