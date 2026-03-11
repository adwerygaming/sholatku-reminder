import { Module } from '@nestjs/common';
import { DiscordService } from '../../../Modules/Discord/discord.service.js';
import { DiscordController } from './discord.controller.js';

@Module({
    controllers: [DiscordController],
    providers: [DiscordService],
})
export class DiscordModule {}
