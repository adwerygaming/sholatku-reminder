import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { env } from './utils/EnvManager.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(env.BACKEND_PORT ?? 9922);
}

bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
  process.exit(1);
});