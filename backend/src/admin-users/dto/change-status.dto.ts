import { IsBoolean } from 'class-validator';

export class ChangeStatusDto {
  @IsBoolean()
  ativo: boolean;
}
