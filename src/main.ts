import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,      // supprime les champs non déclarés dans le DTO
    forbidNonWhitelisted: true, // erreur si champ inconnu envoyé
    transform: true,      // convertit automatiquement les types
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
