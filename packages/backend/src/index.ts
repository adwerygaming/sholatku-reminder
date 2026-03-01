import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './utils/EnvManager';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(env.BACKEND_PORT ?? 9922);
}

bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
  process.exit(1);
});
