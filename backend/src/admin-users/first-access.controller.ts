import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { AdminUsersService } from './admin-users.service';
import { InitialPasswordDto } from './dto/initial-password.dto';

// sem @Roles: qualquer usuário logado chama, mas o service só deixa passar quem tem deve_trocar_senha
@Controller('auth')
export class FirstAccessController {
  constructor(private readonly users: AdminUsersService) {}

  @Post('trocar-senha-inicial')
  @HttpCode(204)
  trocarSenhaInicial(@Body() dto: InitialPasswordDto, @CurrentUser() user: any) {
    return this.users.trocarSenhaInicial(dto, { userId: user.userId, email: user.email });
  }
}
