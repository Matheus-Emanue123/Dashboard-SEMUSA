import { ConflictException, Controller, Post } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { PowerBiViepService } from './powerbi-viep.service';

@Controller('materno-infantil/viep')
export class PowerBiViepController {
  constructor(private readonly service: PowerBiViepService) {}

  // Roda a mesma coleta do job semanal, sob demanda.
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
