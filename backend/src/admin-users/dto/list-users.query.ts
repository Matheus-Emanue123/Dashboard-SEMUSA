import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Role, ROLES } from '../../auth/roles.decorator';

export class ListUsersQuery {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  busca?: string;

  @IsOptional()
  @IsIn(ROLES)
  role?: Role;
}
