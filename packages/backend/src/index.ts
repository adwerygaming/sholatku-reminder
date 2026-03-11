import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { env } from './Utils/EnvManager.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });

  app.enableCors({
    origin: [env.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  await app.listen(env.BACKEND_PORT ?? 9922);
}

bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
  process.exit(1);
});