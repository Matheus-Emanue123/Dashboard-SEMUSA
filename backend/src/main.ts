import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // libera o frontend (React) a chamar essa API em dev
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Dashboard SEMUSA API rodando em http://localhost:${port}/api`);
}
bootstrap();
