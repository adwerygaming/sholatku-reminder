import { Module } from '@nestjs/common';
import { APIModule } from './API/api.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    APIModule,
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
