import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { DiscordPartialGuild } from 'sholatku-reminder-shared/types/Discord.types.js';
import { DiscordChannelRequestResponse } from 'sholatku-reminder-shared/types/RPC.types.js';
import { AuthenticatedRequest, DiscordGuard } from '../../../Modules/Discord/discord.guard.js';
import { DiscordService } from '../../../Modules/Discord/discord.service.js';

@Controller('api/v1/discord')
export class DiscordController {
    constructor(private readonly discordService: DiscordService) {}

    @UseGuards(DiscordGuard)
    @Get('guilds')
    getGuilds(@Req() req: AuthenticatedRequest): Promise<DiscordPartialGuild[]> {
        return this.discordService.fetchAvailableGuilds(req);
    }

    @UseGuards(DiscordGuard)
    @Get('guilds/:guildId/channels')
    getChannels(@Param('guildId') guildId: string): Promise<DiscordChannelRequestResponse[]> {
        return this.discordService.fetchGuildChannels(guildId);
    }
}