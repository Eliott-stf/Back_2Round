import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,      // supprime les champs non déclarés dans le DTO
    forbidNonWhitelisted: true, // erreur si champ inconnu envoyé
    transform: true,      // convertit automatiquement les types
  }));

  // Helmet pour sécuriser les headers HTTP
  app.use(helmet());

  // CORS pour autorise le front React
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('2Round API')
    .setDescription('API du marketplace de boxe 2Round')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //asset statique pr lees images
  app.useStaticAssets(join(process.cwd(), 'public'));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
