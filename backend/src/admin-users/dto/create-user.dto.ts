import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role, ROLES } from '../../auth/roles.decorator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;

  @IsEmail()
  email: string;

  @IsIn(ROLES)
  role: Role;

  @IsString()
  @MinLength(10)
  @MaxLength(72)
  senha: string;

  // sem regra por enquanto: ainda não existe cadastro de unidades
  @IsOptional()
  @IsString()
  @MaxLength(120)
  unidade_saude?: string;
}
