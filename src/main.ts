import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Limite de taille des requêtes
  app.use(express.json({
    limit: '10mb',
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.useGlobalPipes(new ValidationPipe({
    // supprime les champs non déclarés dans le DTO
    whitelist: true,  
    // erreur si champ inconnu envoyé
    forbidNonWhitelisted: true, 
    // convertit automatiquement les types
    transform: true,     
  }));

  // Helmet pour sécuriser les headers HTTP
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS pour autoriser le front React
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://2round.vercel.app'
    ],
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
