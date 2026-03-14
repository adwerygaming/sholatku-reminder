import { Module } from '@nestjs/common';
import { DiscordController } from '../../API/v1/Discord/discord.controller.js';
import { DiscordService } from './discord.service.js';

@Module({
    controllers: [DiscordController],
    providers: [DiscordService],
    exports: [DiscordService],
})
export class DiscordModule {}
