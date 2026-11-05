import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { AdminUsersService } from './admin-users.service';
import { ChangeRoleDto } from './dto/change-role.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQuery } from './dto/list-users.query';
import { ResetPasswordDto } from './dto/reset-password.dto';

// quem executa a ação, no formato que o service e a auditoria usam
const toActor = (user: { userId: string; email?: string }) => ({
  userId: user.userId,
  email: user.email,
});

@Controller('admin/users')
@Roles('ADMIN')
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  listar(@Query() query: ListUsersQuery) {
    return this.users.listar(query);
  }

  @Post()
  criar(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    return this.users.criar(dto, toActor(user));
  }

  @Patch(':id/password')
  redefinirSenha(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetPasswordDto,
    @CurrentUser() user: any,
  ) {
    return this.users.redefinirSenha(id, dto, toActor(user));
  }

  @Patch(':id/role')
  alterarPapel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.users.alterarPapel(id, dto, toActor(user));
  }

  @Patch(':id/status')
  alterarStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.users.alterarStatus(id, dto, toActor(user));
  }

  @Delete(':id')
  @HttpCode(204)
  excluir(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.users.excluir(id, toActor(user));
  }
}
