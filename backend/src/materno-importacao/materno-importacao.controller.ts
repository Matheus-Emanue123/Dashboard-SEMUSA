import {
  BadRequestException,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/roles.decorator';
import { MaternoImportacaoService } from './materno-importacao.service';

@Controller('materno-infantil')
export class MaternoImportacaoController {
  constructor(private readonly service: MaternoImportacaoService) {}

  @Post('importar')
  @Roles('OPERADOR')
  @UseInterceptors(FileInterceptor('arquivo', { limits: { fileSize: 5 * 1024 * 1024 } }))
  importar(
    @UploadedFile(new ParseFilePipeBuilder().build({ fileIsRequired: true }))
    arquivo: Express.Multer.File,
  ) {
    if (!/\.xlsx$/i.test(arquivo.originalname)) {
      throw new BadRequestException('Envie um arquivo .xlsx válido.');
    }
    return this.service.importar(arquivo.buffer);
  }
}
