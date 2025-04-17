// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common'; // Import ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips properties that don't have any decorators
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted values are provided
    transform: true, // Automatically transform payloads to DTO instances
    transformOptions: {
       enableImplicitConversion: true, // Allow basic type conversions (e.g., string to number for path params)
    },
  }));

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.enableShutdownHooks();

  // Configure CORS (Important for connecting the frontend later)
  app.enableCors({
    origin: 'http://localhost:3002', // Replace with your frontend URL in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  await app.listen(3001);
  console.log(`Backend application is running on: ${await app.getUrl()}`);
}
bootstrap();