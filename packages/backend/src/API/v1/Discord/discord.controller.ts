import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, DiscordGuard } from '../../../Modules/Discord/discord.guard.js';
import { DiscordService } from '../../../Modules/Discord/discord.service.js';
import { DiscordPartialGuild } from 'sholatku-reminder-shared/types/Discord.types.js';

@Controller('api/v1/discord')
export class DiscordController {
    constructor(private readonly discordService: DiscordService) {}

    @UseGuards(DiscordGuard)
    @Get('guilds')
    getGuilds(@Req() req: AuthenticatedRequest): Promise<DiscordPartialGuild[]> {
        return this.discordService.fetchAvailableGuilds(req);
    }
}