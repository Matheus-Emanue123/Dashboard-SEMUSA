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

// Assinatura ZIP: todo .xlsx é um arquivo ZIP por dentro, então o conteúdo precisa começar com "PK".
// O mimetype enviado pelo cliente não é confiável (quem faz a chamada escolhe o valor), por
// isso a validação real de tipo é pela assinatura do conteúdo, não pelo nome nem pelo header.
const ASSINATURA_ZIP = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

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
    if (!arquivo.buffer.subarray(0, 4).equals(ASSINATURA_ZIP)) {
      throw new BadRequestException('Conteúdo do arquivo não corresponde a um .xlsx válido.');
    }
    return this.service.importar(arquivo.buffer);
  }
}
