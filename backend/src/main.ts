import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  // em produção só os endereços de CORS_ORIGIN (separados por vírgula) podem chamar a API.
  // em dev, sem a variável, qualquer origem é aceita
  const origins = process.env.CORS_ORIGIN?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins?.length ? origins : process.env.NODE_ENV !== 'production',
  });
  app.setGlobalPrefix('api');
  // valida os DTOs e descarta campos que não estão declarados neles
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Dashboard SEMUSA API rodando em http://localhost:${port}/api`);
}
bootstrap();
