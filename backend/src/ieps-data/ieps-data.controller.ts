import { ConflictException, Controller, Post } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { IepsDataService } from './ieps-data.service';

@Controller('materno-infantil/ieps')
export class IepsDataController {
  constructor(private readonly service: IepsDataService) {}

  // Roda a mesma coleta do job mensal, sob demanda.
  @Post('sincronizar')
  @Roles('OPERADOR', 'ADMIN')
  async sincronizar() {
    try {
      return await this.service.sincronizar();
    } catch (e) {
      throw new ConflictException((e as Error).message);
    }
  }
}
