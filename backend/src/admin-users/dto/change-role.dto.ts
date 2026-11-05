import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Role, ROLES } from '../../auth/roles.decorator';

export class ChangeRoleDto {
  @IsIn(ROLES)
  role: Role;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  unidade_saude?: string;
}
