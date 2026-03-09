import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { APIModule } from './API/api.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { auth } from './Lib/Auth.js';

@Module({
  imports: [
    APIModule,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    AuthModule.forRoot({ auth })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
