import {
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiKeyGuard } from './api-key.guard';
import { MaternoImportacaoService } from './materno-importacao.service';

@Controller('materno-infantil')
export class MaternoImportacaoController {
  constructor(private readonly service: MaternoImportacaoService) {}

  @Post('importar')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(FileInterceptor('arquivo', { limits: { fileSize: 5 * 1024 * 1024 } }))
  importar(
    @UploadedFile(new ParseFilePipeBuilder().build({ fileIsRequired: true }))
    arquivo: Express.Multer.File,
  ) {
    return this.service.importar(arquivo.buffer);
  }
}